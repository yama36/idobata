import React, { createContext, useContext, useEffect, useState } from "react";
import { apiClient } from "../services/api/apiClient";

interface SiteConfig {
  _id: string;
  title: string;
  aboutMessage: string;
}

interface SiteConfigContextType {
  siteConfig: SiteConfig | null;
  loading: boolean;
  error: string | null;
}

const SiteConfigContext = createContext<SiteConfigContextType>({
  siteConfig: null,
  loading: true,
  error: null,
});

export const useSiteConfig = () => useContext(SiteConfigContext);

export const SiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSiteConfig = async () => {
      const result = await apiClient.getSiteConfig();

      result.match(
        (data) => {
          setSiteConfig(data);
          setError(null);
        },
        (error) => {
          console.error("Failed to fetch site config:", error);
          setError("サイト設定の取得に失敗しました");
          setSiteConfig({
            _id: "default",
            title: "みんなの対話の場",
            aboutMessage: `# このサイトについて

このサイトは、テーマに沿って意見を出し合い、話し合いの内容をまとめるための場です。誰でも自由に参加し、対話に加わることができます。

## 話し合いの流れ

### ステップ1：問題を見つける
日常生活で感じる課題や問題点を投稿してください。
他の参加者の投稿を見て、共感できる問題に「いいね」をつけることもできます。

### ステップ2：アイデアをつくる
問題に対する解決策やアイデアを提案してください。
他の参加者のアイデアにコメントを付けたり、改善案を提案することもできます。

## 誰でも参加できます

年齢や職業、居住地に関係なく、誰でも参加できます。
匿名での投稿も可能で、専門知識は必要ありません。
あなたの日常の経験や感じたことが、話し合いのまとめに活かされます。

## めざすこと

多様な意見が交わされ、建設的な議論が生まれる場にしていきたいと考えています。
ぜひ、この対話の場に参加して、あなたの声を聞かせてください。`,
          });
        }
      );

      setLoading(false);
    };

    fetchSiteConfig();
  }, []);

  return (
    <SiteConfigContext.Provider value={{ siteConfig, loading, error }}>
      {children}
    </SiteConfigContext.Provider>
  );
};
