#!/usr/bin/env python3
"""
開発用の Mongo シードデータを自動生成するスクリプト。
都道府県・業種の全選択肢を網羅しつつ、店舗ごとに複数のアンケートを作る。
"""

from __future__ import annotations

import json
import random
import secrets
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path
from typing import List


PROJECT_ROOT = Path(__file__).resolve().parent.parent
SAMPLE_DIR = PROJECT_ROOT / "sample"
STORES_JSON = SAMPLE_DIR / "stores.json"
SURVEYS_JSON = SAMPLE_DIR / "surveys.json"

PREFECTURES = [
    "北海道",
    "青森県",
    "岩手県",
    "宮城県",
    "秋田県",
    "山形県",
    "福島県",
    "茨城県",
    "栃木県",
    "群馬県",
    "埼玉県",
    "千葉県",
    "東京都",
    "神奈川県",
    "新潟県",
    "富山県",
    "石川県",
    "福井県",
    "山梨県",
    "長野県",
    "岐阜県",
    "静岡県",
    "愛知県",
    "三重県",
    "滋賀県",
    "京都府",
    "大阪府",
    "兵庫県",
    "奈良県",
    "和歌山県",
    "鳥取県",
    "島根県",
    "岡山県",
    "広島県",
    "山口県",
    "徳島県",
    "香川県",
    "愛媛県",
    "高知県",
    "福岡県",
    "佐賀県",
    "長崎県",
    "熊本県",
    "大分県",
    "宮崎県",
    "鹿児島県",
    "沖縄県",
]

INDUSTRIES = ["デリヘル", "ホテヘル", "箱ヘル", "ソープ", "DC", "風エス", "メンエス"]
AREAS = ["吉原", "すすきの", "中洲", "歌舞伎町", "福原", "川崎堀之内", "梅田", "錦三"]
GENRES = ["熟女", "学園系", "スタンダード", "格安店", "高級店"]
WORK_TYPES = ["在籍", "出稼ぎ"]

INDUSTRY_TITLES = {
    "デリヘル": "ルミナリエ",
    "ホテヘル": "ロゼクラブ",
    "箱ヘル": "ラウンジ",
    "ソープ": "オアシス",
    "DC": "ダイヤ",
    "風エス": "スパ",
    "メンエス": "スタジオ",
}

CUSTOMER_COMMENTS = [
    "{name}は{area}エリアで客層が落ち着いており、常連比率が高くて安定して稼げました。",
    "{name}ではSNS指名が伸びやすく、短期の{work_type}でもリピートがつきました。",
    "{name}は旅行客が多いので、推しオプションを提案すると単価が伸びます。",
]

STAFF_COMMENTS = [
    "受付スタッフがこまめに連絡をくれるので、待機中の不安がありませんでした。",
    "シフト管理がアプリ化されていて、急な調整もすぐ対応してもらえました。",
    "送迎ドライバーさんが各ホテル事情を熟知しており、道に迷うことがありません。",
]

ENVIRONMENT_COMMENTS = [
    "控室が個室で、仮眠スペースやWi-Fiが完備されている点が助かります。",
    "衣装と備品が常に清潔で、バックヤードの雰囲気も穏やかです。",
    "待機フロアに軽食と飲み物があり、長時間のシフトでも体調管理が楽でした。",
]


def new_object_id() -> str:
    return secrets.token_hex(12)


def iso_date(base: datetime, add_days: int) -> dict:
    dt = base + timedelta(days=add_days)
    return {"$date": dt.strftime("%Y-%m-%dT%H:%M:%SZ")}


def to_slug(index: int) -> str:
    return f"store-{index:02d}"


def make_store_name(prefecture: str, industry: str) -> str:
    title = INDUSTRY_TITLES[industry]
    return f"{prefecture}{title}"


@dataclass
class StoreRecord:
    oid: str
    index: int
    name: str
    branch: str | None
    prefecture: str
    area: str
    industry: str
    genre: str
    business_hours: dict
    created_at: dict
    updated_at: dict
    slug: str


def generate_store_records() -> List[StoreRecord]:
    stores: List[StoreRecord] = []
    base_date = datetime(2024, 1, 1, 3, 0, 0)
    idx = 0
    for prefecture in PREFECTURES:
        for industry in INDUSTRIES:
            idx += 1
            area = AREAS[(idx - 1) % len(AREAS)]
            genre = GENRES[(idx - 1) % len(GENRES)]
            branch = f"{area}店" if idx % 4 == 0 else None
            open_hour = 9 + (idx % 4)
            close_hour = min(open_hour + 12, 23)
            business_hours = {"open": f"{open_hour:02d}:00", "close": f"{close_hour:02d}:30"}
            slug = to_slug(idx)
            store = StoreRecord(
                oid=new_object_id(),
                index=idx,
                name=f"{make_store_name(prefecture, industry)} {idx % 3 + 1}号店",
                branch=branch,
                prefecture=prefecture,
                area=area,
                industry=industry,
                genre=genre,
                business_hours=business_hours,
                created_at=iso_date(base_date, idx * 2),
                updated_at=iso_date(base_date, idx * 2 + 8),
                slug=slug,
            )
            stores.append(store)
    return stores


def build_store_document(store: StoreRecord, average_rating: float) -> dict:
    document = {
        "_id": {"$oid": store.oid},
        "name": store.name,
        "prefecture": store.prefecture,
        "industry": store.industry,
        "businessHours": store.business_hours,
        "averageRating": round(average_rating, 1),
        "createdAt": store.created_at,
        "updatedAt": store.updated_at,
    }
    if store.branch:
        document["branchName"] = store.branch
    if store.area:
        document["area"] = store.area
    if store.genre:
        document["genre"] = store.genre
    return document


def make_comment(templates: List[str], store: StoreRecord, work_type: str) -> str:
    template = templates[store.index % len(templates)]
    return template.format(name=store.name, area=store.area, work_type=work_type)


def clamp(value: float, min_value: float, max_value: float) -> float:
    return max(min_value, min(max_value, value))


def generate_surveys_for_store(store: StoreRecord, rng: random.Random) -> tuple[List[dict], float]:
    surveys: List[dict] = []
    ratings: List[float] = []
    base_date = datetime(2024, 2, 1, 6, 0, 0)
    survey_count = rng.randint(2, 10)
    for offset in range(survey_count):
        survey_oid = new_object_id()
        work_type = rng.choice(WORK_TYPES)
        rating = clamp(3.1 + ((store.index * 3 + offset * 5) % 22) / 10, 3.1, 5.0)
        ratings.append(rating)
        visited_month = (offset + store.index) % 12 + 1
        visited_period = f"2024-{visited_month:02d}"
        helpful = (store.index * 17 + offset * 23) % 180
        age = 20 + ((store.index + offset) % 18)
        spec_score = 80 + ((store.index * 5 + offset * 7) % 55)
        wait_time = 1 + ((store.index + offset) % 6)
        average_earning = 5 + ((store.index + offset) % 12)
        survey = {
            "_id": {"$oid": survey_oid},
            "storeId": {"$oid": store.oid},
            "storeName": store.name,
            "storePrefecture": store.prefecture,
            "storeIndustry": store.industry,
            "visitedPeriod": visited_period,
            "workType": work_type,
            "age": age,
            "specScore": spec_score,
            "waitTimeHours": wait_time,
            "averageEarning": average_earning,
            "rating": round(rating, 1),
            "customerComment": make_comment(CUSTOMER_COMMENTS, store, work_type),
            "staffComment": make_comment(STAFF_COMMENTS, store, work_type),
            "workEnvironmentComment": make_comment(ENVIRONMENT_COMMENTS, store, work_type),
            "emailAddress": f"{store.slug}-survey-{offset + 1}@example.com",
            "imageUrls": [
                f"https://cdn.example.com/surveys/{store.slug}/photo-{offset + 1}.jpg",
                f"https://cdn.example.com/surveys/{store.slug}/photo-{offset + 2}.jpg",
            ],
            "helpfulCount": helpful,
            "createdAt": iso_date(base_date, store.index * 5 + offset),
            "updatedAt": iso_date(base_date, store.index * 5 + offset + 1),
        }
        if store.branch:
            survey["storeBranchName"] = store.branch
        if store.area:
            survey["storeArea"] = store.area
        if store.genre:
            survey["storeGenre"] = store.genre
        surveys.append(survey)
    average_rating = sum(ratings) / len(ratings)
    return surveys, average_rating


def main() -> None:
    rng = random.Random(42)
    stores = generate_store_records()
    survey_docs: List[dict] = []
    store_docs: List[dict] = []

    for store in stores:
        surveys, avg_rating = generate_surveys_for_store(store, rng)
        survey_docs.extend(surveys)
        store_docs.append(build_store_document(store, avg_rating))

    SAMPLE_DIR.mkdir(parents=True, exist_ok=True)
    STORES_JSON.write_text(json.dumps(store_docs, ensure_ascii=False, indent=2), encoding="utf-8")
    SURVEYS_JSON.write_text(json.dumps(survey_docs, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Generated {len(store_docs)} stores and {len(survey_docs)} surveys at {SAMPLE_DIR}")


if __name__ == "__main__":
    main()
