# 01. Data Mapping Specification

## 1.1. Bảng ánh xạ dữ liệu (Data Mapping Table)
Bảng mô tả ánh xạ các trường dữ liệu giữa nguồn (Source) và đích (Target):

| Source Table | Source Field | Target Table | Target Field | DataType | Transformation Rule |
| --- | --- | --- | --- | --- | --- |
| old_user | usr_id | users | id | UUID | Generate new UUID |
| old_user | usr_name | users | full_name | VARCHAR | Trim spaces |
