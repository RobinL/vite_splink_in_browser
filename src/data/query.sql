WITH
__splink__compare_two_records_left_with_tf as (
    select __splink__compare_two_records_left.*
    from __splink__compare_two_records_left
),


__splink__compare_two_records_right_with_tf as (
    select __splink__compare_two_records_right.*
    from __splink__compare_two_records_right
),


__splink__compare_two_records_left_with_tf_uid_fix as (
        select *
        from  __splink__compare_two_records_left_with_tf
        ),

__splink__compare_two_records_right_with_tf_uid_fix as (
        select *
        from  __splink__compare_two_records_right_with_tf
        ),

__splink__compare_two_records_blocked as (
        select "l"."unique_id" AS "unique_id_l", "r"."unique_id" AS "unique_id_r", "l"."surname" AS "surname_l", "r"."surname" AS "surname_r", "l"."first_name" AS "first_name_l", "r"."first_name" AS "first_name_r", "l"."first_name_surname_concat" AS "first_name_surname_concat_l", "r"."first_name_surname_concat" AS "first_name_surname_concat_r", "l"."tf_first_name_surname_concat" AS "tf_first_name_surname_concat_l", "r"."tf_first_name_surname_concat" AS "tf_first_name_surname_concat_r", "l"."tf_surname" AS "tf_surname_l", "r"."tf_surname" AS "tf_surname_r", "l"."tf_first_name" AS "tf_first_name_l", "r"."tf_first_name" AS "tf_first_name_r", "l"."dob" AS "dob_l", "r"."dob" AS "dob_r", "l"."postcode_fake" AS "postcode_fake_l", "r"."postcode_fake" AS "postcode_fake_r", "l"."birth_place" AS "birth_place_l", "r"."birth_place" AS "birth_place_r", "l"."tf_birth_place" AS "tf_birth_place_l", "r"."tf_birth_place" AS "tf_birth_place_r", "l"."occupation" AS "occupation_l", "r"."occupation" AS "occupation_r", "l"."tf_occupation" AS "tf_occupation_l", "r"."tf_occupation" AS "tf_occupation_r", 0 as match_key
        from __splink__compare_two_records_left_with_tf_uid_fix as l
        cross join __splink__compare_two_records_right_with_tf_uid_fix as r
        ),

__splink__df_comparison_vectors as (
        select "unique_id_l", "unique_id_r", "surname_l", "surname_r", "first_name_l", "first_name_r", "first_name_surname_concat_l", "first_name_surname_concat_r", CASE WHEN ("first_name_l" IS NULL OR "first_name_r" IS NULL) AND ("surname_l" IS NULL OR "surname_r" IS NULL) THEN -1 WHEN "first_name_surname_concat_l" = "first_name_surname_concat_r" THEN 6 WHEN "first_name_l" = "surname_r" AND "first_name_r" = "surname_l" THEN 5 WHEN (jaro_winkler_similarity("first_name_l", "first_name_r") >= 0.92) AND (jaro_winkler_similarity("surname_l", "surname_r") >= 0.92) THEN 4 WHEN (jaro_winkler_similarity("first_name_l", "first_name_r") >= 0.88) AND (jaro_winkler_similarity("surname_l", "surname_r") >= 0.88) THEN 3 WHEN "surname_l" = "surname_r" THEN 2 WHEN "first_name_l" = "first_name_r" THEN 1 ELSE 0 END as gamma_first_name_surname, "tf_first_name_surname_concat_l", "tf_first_name_surname_concat_r", "tf_surname_l", "tf_surname_r", "tf_first_name_l", "tf_first_name_r", "dob_l", "dob_r", CASE WHEN try_strptime("dob_l", '%Y-%m-%d') IS NULL OR try_strptime("dob_r", '%Y-%m-%d') IS NULL THEN -1 WHEN "dob_l" = "dob_r" THEN 5 WHEN damerau_levenshtein("dob_l", "dob_r") <= 1 THEN 4 WHEN ABS(EPOCH(try_strptime("dob_l", '%Y-%m-%d')) - EPOCH(try_strptime("dob_r", '%Y-%m-%d'))) <= 2629800.0 THEN 3 WHEN ABS(EPOCH(try_strptime("dob_l", '%Y-%m-%d')) - EPOCH(try_strptime("dob_r", '%Y-%m-%d'))) <= 31557600.0 THEN 2 WHEN ABS(EPOCH(try_strptime("dob_l", '%Y-%m-%d')) - EPOCH(try_strptime("dob_r", '%Y-%m-%d'))) <= 315576000.0 THEN 1 ELSE 0 END as gamma_dob, "postcode_fake_l", "postcode_fake_r", CASE WHEN "postcode_fake_l" IS NULL OR "postcode_fake_r" IS NULL THEN -1 WHEN "postcode_fake_l" = "postcode_fake_r" THEN 4 WHEN NULLIF(regexp_extract("postcode_fake_l", '^[A-Za-z]{1,2}[0-9][A-Za-z0-9]? [0-9]', 0), '') = NULLIF(regexp_extract("postcode_fake_r", '^[A-Za-z]{1,2}[0-9][A-Za-z0-9]? [0-9]', 0), '') THEN 3 WHEN NULLIF(regexp_extract("postcode_fake_l", '^[A-Za-z]{1,2}[0-9][A-Za-z0-9]?', 0), '') = NULLIF(regexp_extract("postcode_fake_r", '^[A-Za-z]{1,2}[0-9][A-Za-z0-9]?', 0), '') THEN 2 WHEN NULLIF(regexp_extract("postcode_fake_l", '^[A-Za-z]{1,2}', 0), '') = NULLIF(regexp_extract("postcode_fake_r", '^[A-Za-z]{1,2}', 0), '') THEN 1 ELSE 0 END as gamma_postcode_fake, "birth_place_l", "birth_place_r", CASE WHEN "birth_place_l" IS NULL OR "birth_place_r" IS NULL THEN -1 WHEN "birth_place_l" = "birth_place_r" THEN 1 ELSE 0 END as gamma_birth_place, "tf_birth_place_l", "tf_birth_place_r", "occupation_l", "occupation_r", CASE WHEN "occupation_l" IS NULL OR "occupation_r" IS NULL THEN -1 WHEN "occupation_l" = "occupation_r" THEN 1 ELSE 0 END as gamma_occupation, "tf_occupation_l", "tf_occupation_r", match_key
        from __splink__compare_two_records_blocked
        ),

__splink__df_match_weight_parts as (
    select "unique_id_l","unique_id_r","surname_l","surname_r","first_name_l","first_name_r","first_name_surname_concat_l","first_name_surname_concat_r",gamma_first_name_surname,"tf_first_name_surname_concat_l","tf_first_name_surname_concat_r","tf_surname_l","tf_surname_r","tf_first_name_l","tf_first_name_r",CASE
WHEN
gamma_first_name_surname = -1
THEN cast(1.0 as float8)

WHEN
gamma_first_name_surname = 6
THEN cast(2207.4941659856004 as float8)

WHEN
gamma_first_name_surname = 5
THEN cast(91.10562578812065 as float8)

WHEN
gamma_first_name_surname = 4
THEN cast(3003.5863697460127 as float8)

WHEN
gamma_first_name_surname = 3
THEN cast(2023.1497034041115 as float8)

WHEN
gamma_first_name_surname = 2
THEN cast(502.3260583641111 as float8)

WHEN
gamma_first_name_surname = 1
THEN cast(4.557874935862959 as float8)

WHEN
gamma_first_name_surname = 0
THEN cast(0.1819834688227542 as float8)
 END as bf_first_name_surname ,CASE WHEN  gamma_first_name_surname = -1 then cast(1 as float8) WHEN  gamma_first_name_surname = 6 then
    (CASE WHEN coalesce("tf_first_name_surname_concat_l", "tf_first_name_surname_concat_r") is not null
    THEN
    POW(
        cast(0.00018837565244692124 as float8) /
    (CASE
        WHEN coalesce("tf_first_name_surname_concat_l", "tf_first_name_surname_concat_r") >= coalesce("tf_first_name_surname_concat_r", "tf_first_name_surname_concat_l")
        THEN coalesce("tf_first_name_surname_concat_l", "tf_first_name_surname_concat_r")
        ELSE coalesce("tf_first_name_surname_concat_r", "tf_first_name_surname_concat_l")
    END)
    ,
        cast(1.0 as float8)
    )
    ELSE cast(1 as float8)
    END) WHEN  gamma_first_name_surname = 5 then cast(1 as float8) WHEN  gamma_first_name_surname = 4 then cast(1 as float8) WHEN  gamma_first_name_surname = 3 then cast(1 as float8) WHEN  gamma_first_name_surname = 2 then
    (CASE WHEN coalesce("tf_surname_l", "tf_surname_r") is not null
    THEN
    POW(
        cast(0.0003449310933318625 as float8) /
    (CASE
        WHEN coalesce("tf_surname_l", "tf_surname_r") >= coalesce("tf_surname_r", "tf_surname_l")
        THEN coalesce("tf_surname_l", "tf_surname_r")
        ELSE coalesce("tf_surname_r", "tf_surname_l")
    END)
    ,
        cast(1.0 as float8)
    )
    ELSE cast(1 as float8)
    END) WHEN  gamma_first_name_surname = 1 then
    (CASE WHEN coalesce("tf_first_name_l", "tf_first_name_r") is not null
    THEN
    POW(
        cast(0.012954432396369526 as float8) /
    (CASE
        WHEN coalesce("tf_first_name_l", "tf_first_name_r") >= coalesce("tf_first_name_r", "tf_first_name_l")
        THEN coalesce("tf_first_name_l", "tf_first_name_r")
        ELSE coalesce("tf_first_name_r", "tf_first_name_l")
    END)
    ,
        cast(1.0 as float8)
    )
    ELSE cast(1 as float8)
    END) WHEN  gamma_first_name_surname = 0 then cast(1 as float8) END as bf_tf_adj_first_name_surname ,"dob_l","dob_r",gamma_dob,CASE
WHEN
gamma_dob = -1
THEN cast(1.0 as float8)

WHEN
gamma_dob = 5
THEN cast(287.8666897462343 as float8)

WHEN
gamma_dob = 4
THEN cast(11.905164776639024 as float8)

WHEN
gamma_dob = 3
THEN cast(1.0495585603006337 as float8)

WHEN
gamma_dob = 2
THEN cast(0.17160219242546443 as float8)

WHEN
gamma_dob = 1
THEN cast(0.10621163848246187 as float8)

WHEN
gamma_dob = 0
THEN cast(0.014783539166307159 as float8)
 END as bf_dob ,"postcode_fake_l","postcode_fake_r",gamma_postcode_fake,CASE
WHEN
gamma_postcode_fake = -1
THEN cast(1.0 as float8)

WHEN
gamma_postcode_fake = 4
THEN cast(4566.85681306812 as float8)

WHEN
gamma_postcode_fake = 3
THEN cast(272.9339534499078 as float8)

WHEN
gamma_postcode_fake = 2
THEN cast(69.1181221394146 as float8)

WHEN
gamma_postcode_fake = 1
THEN cast(8.650395383694073 as float8)

WHEN
gamma_postcode_fake = 0
THEN cast(0.08936366617204254 as float8)
 END as bf_postcode_fake ,"birth_place_l","birth_place_r",gamma_birth_place,"tf_birth_place_l","tf_birth_place_r",CASE
WHEN
gamma_birth_place = -1
THEN cast(1.0 as float8)

WHEN
gamma_birth_place = 1
THEN cast(165.74688299251966 as float8)

WHEN
gamma_birth_place = 0
THEN cast(0.1640369877243804 as float8)
 END as bf_birth_place ,CASE WHEN  gamma_birth_place = -1 then cast(1 as float8) WHEN  gamma_birth_place = 1 then
    (CASE WHEN coalesce("tf_birth_place_l", "tf_birth_place_r") is not null
    THEN
    POW(
        cast(0.00504860879279373 as float8) /
    (CASE
        WHEN coalesce("tf_birth_place_l", "tf_birth_place_r") >= coalesce("tf_birth_place_r", "tf_birth_place_l")
        THEN coalesce("tf_birth_place_l", "tf_birth_place_r")
        ELSE coalesce("tf_birth_place_r", "tf_birth_place_l")
    END)
    ,
        cast(1.0 as float8)
    )
    ELSE cast(1 as float8)
    END) WHEN  gamma_birth_place = 0 then cast(1 as float8) END as bf_tf_adj_birth_place ,"occupation_l","occupation_r",gamma_occupation,"tf_occupation_l","tf_occupation_r",CASE
WHEN
gamma_occupation = -1
THEN cast(1.0 as float8)

WHEN
gamma_occupation = 1
THEN cast(23.044469708066792 as float8)

WHEN
gamma_occupation = 0
THEN cast(0.10761433478856082 as float8)
 END as bf_occupation ,CASE WHEN  gamma_occupation = -1 then cast(1 as float8) WHEN  gamma_occupation = 1 then
    (CASE WHEN coalesce("tf_occupation_l", "tf_occupation_r") is not null
    THEN
    POW(
        cast(0.038906190525623725 as float8) /
    (CASE
        WHEN coalesce("tf_occupation_l", "tf_occupation_r") >= coalesce("tf_occupation_r", "tf_occupation_l")
        THEN coalesce("tf_occupation_l", "tf_occupation_r")
        ELSE coalesce("tf_occupation_r", "tf_occupation_l")
    END)
    ,
        cast(1.0 as float8)
    )
    ELSE cast(1 as float8)
    END) WHEN  gamma_occupation = 0 then cast(1 as float8) END as bf_tf_adj_occupation ,match_key
    from __splink__df_comparison_vectors
    )

    select
    log2(cast(0.00013584539607096294 as float8) * bf_first_name_surname * bf_tf_adj_first_name_surname * bf_dob * bf_postcode_fake * bf_birth_place * bf_tf_adj_birth_place * bf_occupation * bf_tf_adj_occupation) as match_weight,
    CASE WHEN bf_first_name_surname = cast('infinity' as float8) OR bf_tf_adj_first_name_surname = cast('infinity' as float8) OR bf_dob = cast('infinity' as float8) OR bf_postcode_fake = cast('infinity' as float8) OR bf_birth_place = cast('infinity' as float8) OR bf_tf_adj_birth_place = cast('infinity' as float8) OR bf_occupation = cast('infinity' as float8) OR bf_tf_adj_occupation = cast('infinity' as float8) THEN 1.0 ELSE (cast(0.00013584539607096294 as float8) * bf_first_name_surname * bf_tf_adj_first_name_surname * bf_dob * bf_postcode_fake * bf_birth_place * bf_tf_adj_birth_place * bf_occupation * bf_tf_adj_occupation)/(1+(cast(0.00013584539607096294 as float8) * bf_first_name_surname * bf_tf_adj_first_name_surname * bf_dob * bf_postcode_fake * bf_birth_place * bf_tf_adj_birth_place * bf_occupation * bf_tf_adj_occupation)) END as match_probability,
    "unique_id_l","unique_id_r","surname_l","surname_r","first_name_l","first_name_r","first_name_surname_concat_l","first_name_surname_concat_r",gamma_first_name_surname,"tf_first_name_surname_concat_l","tf_first_name_surname_concat_r","tf_surname_l","tf_surname_r","tf_first_name_l","tf_first_name_r",bf_first_name_surname,bf_tf_adj_first_name_surname,"dob_l","dob_r",gamma_dob,bf_dob,"postcode_fake_l","postcode_fake_r",gamma_postcode_fake,bf_postcode_fake,"birth_place_l","birth_place_r",gamma_birth_place,"tf_birth_place_l","tf_birth_place_r",bf_birth_place,bf_tf_adj_birth_place,"occupation_l","occupation_r",gamma_occupation,"tf_occupation_l","tf_occupation_r",bf_occupation,bf_tf_adj_occupation,match_key
    from __splink__df_match_weight_parts
