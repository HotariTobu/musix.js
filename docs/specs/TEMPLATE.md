# 仕様書: [機能名]

> このファイルをコピーして新しい仕様書を作成してください。
> ファイル名: `NNNN-機能名.md`（NNNNは連番）

## 概要

<!-- この機能が何をするのか、1-2文で説明 -->

## 背景・目的

<!-- なぜこの機能が必要なのか -->

## 要件

### 機能要件

<!-- 実装すべき機能の一覧 -->

- [ ] 要件1
- [ ] 要件2
- [ ] 要件3

### 非機能要件

<!-- パフォーマンス、セキュリティ、互換性など -->

- [ ] 要件1

## API設計

### 関数/メソッド

```typescript
/**
 * 関数の説明
 * @param param1 - パラメータの説明
 * @returns 戻り値の説明
 */
function exampleFunction(param1: Type): ReturnType;
```

### 型定義

```typescript
interface ExampleInterface {
  property1: Type;
  property2: Type;
}
```

## 使用例

```typescript
// 基本的な使用例
import { exampleFunction } from 'musix.js';

const result = exampleFunction(param);
```

## エラーハンドリング

| エラー種別 | 条件 | メッセージ |
|-----------|------|-----------|
| TypeError | 無効な引数が渡された場合 | "Invalid argument: ..." |

## テスト要件

### 正常系

- [ ] テストケース1
- [ ] テストケース2

### 異常系

- [ ] エラーケース1
- [ ] エラーケース2

## 実装メモ

<!-- 実装時の注意点、参考情報など -->

## 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|-----------|---------|--------|
| YYYY-MM-DD | 1.0 | 初版作成 | - |
