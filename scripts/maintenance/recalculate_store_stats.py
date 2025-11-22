#!/usr/bin/env python3
"""
stores コレクションに保存されている統計情報 (stats) を
アンケート（surveys）コレクションの最新内容から再計算して同期するメンテナンススクリプト。

対象:
  - stats.surveyCount
  - stats.avgRating
  - stats.avgEarning
  - stats.avgWaitTime
  - stats.lastReviewedAt

計算対象となるアンケートは status が "approved" のもの、もしくは status フィールドが存在しないもの。

実行例:
  MONGO_URI="mongodb+srv://..." \
  MONGO_DB="makoto-club" \
  python scripts/maintenance/recalculate_store_stats.py --dry-run

  # 問題なければ --apply を付けて反映
  python scripts/maintenance/recalculate_store_stats.py --apply
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timezone
from typing import Dict, Tuple

from bson import ObjectId
from pymongo import MongoClient
from pymongo.collection import Collection


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Recalculate store stats from approved surveys.")
    parser.add_argument(
        "--apply",
        action="store_true",
        help="実際に更新を適用します。指定しない場合は dry-run になります。",
    )
    parser.add_argument(
        "--survey-collection",
        default=os.getenv("SURVEY_COLLECTION", "surveys"),
        help="アンケートのコレクション名 (default: %(default)s)",
    )
    parser.add_argument(
        "--store-collection",
        default=os.getenv("STORE_COLLECTION", "stores"),
        help="店舗のコレクション名 (default: %(default)s)",
    )
    parser.add_argument(
        "--database",
        default=os.getenv("MONGO_DB", "makoto-club"),
        help="MongoDB データベース名 (default: %(default)s)",
    )
    parser.add_argument(
        "--uri",
        default=os.getenv("MONGO_URI", "mongodb://localhost:27017"),
        help="MongoDB 接続 URI (default: %(default)s)",
    )
    return parser.parse_args()


def fetch_survey_stats(collection: Collection) -> Dict[ObjectId, Dict[str, object]]:
    pipeline = [
        {
            "$match": {
                "$or": [
                    {"status": {"$exists": False}},
                    {"status": "approved"},
                ],
            }
        },
        {
            "$group": {
                "_id": "$storeId",
                "surveyCount": {"$sum": 1},
                "avgRating": {"$avg": "$rating"},
                "avgEarning": {"$avg": "$averageEarning"},
                "avgWaitTime": {"$avg": "$waitTimeHours"},
                "lastSurveyedAt": {"$max": "$createdAt"},
            }
        },
    ]

    stats: Dict[ObjectId, Dict[str, object]] = {}
    for doc in collection.aggregate(pipeline):
        store_id = doc.get("_id")
        if not isinstance(store_id, ObjectId):
            continue
        stats[store_id] = {
            "surveyCount": doc.get("surveyCount", 0) or 0,
            "avgRating": doc.get("avgRating"),
            "avgEarning": doc.get("avgEarning"),
            "avgWaitTime": doc.get("avgWaitTime"),
            "lastSurveyedAt": doc.get("lastSurveyedAt"),
        }
    return stats


def recalc_stores(
    stores: Collection,
    stats_map: Dict[ObjectId, Dict[str, object]],
    apply_changes: bool,
) -> Tuple[int, int]:
    updated = 0
    zeroed = 0
    now = datetime.now(timezone.utc)

    cursor = stores.find({}, {"_id": 1})
    for doc in cursor:
        store_id = doc.get("_id")
        if not isinstance(store_id, ObjectId):
            continue

        stats = stats_map.get(store_id)
        if stats is None:
            update = {
                "stats.surveyCount": 0,
                "stats.avgRating": None,
                "stats.avgEarning": None,
                "stats.avgWaitTime": None,
                "stats.lastSurveyedAt": None,
                "updatedAt": now,
            }
            zeroed += 1
        else:
            update = {
                "stats.surveyCount": int(stats.get("surveyCount", 0) or 0),
                "stats.avgRating": stats.get("avgRating"),
                "stats.avgEarning": stats.get("avgEarning"),
                "stats.avgWaitTime": stats.get("avgWaitTime"),
                "stats.lastSurveyedAt": stats.get("lastSurveyedAt"),
                "updatedAt": now,
            }

        updated += 1
        if apply_changes:
            stores.update_one({"_id": store_id}, {"$set": update})

    return updated, zeroed


def main() -> int:
    args = parse_args()
    apply_changes = args.apply

    client = MongoClient(args.uri)
    database = client[args.database]
    stores = database[args.store_collection]
    surveys = database[args.survey_collection]

    print(f"== 対象データベース: {args.database}")
    print(f"== 店舗コレクション: {args.store_collection}")
    print(f"== アンケートコレクション: {args.survey_collection}")
    print(f"== モード: {'apply (更新を適用)' if apply_changes else 'dry-run (確認のみ)'}")

    stats_map = fetch_survey_stats(surveys)
    print(f"\nアンケート統計を取得: {len(stats_map)} 店舗分")

    total, zeroed = recalc_stores(stores, stats_map, apply_changes)

    print(f"\n処理対象店舗数: {total}")
    print(f"統計がゼロになった店舗数: {zeroed}")
    print(f"統計が反映された店舗数: {total - zeroed}")

    if not apply_changes:
        print("\n--apply を付けて実行すると更新が反映されます。")

    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        print("\n中断しました。", file=sys.stderr)
        raise SystemExit(1)
