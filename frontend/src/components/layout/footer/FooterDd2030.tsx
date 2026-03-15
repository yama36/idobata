import { ArrowUpRight, Github, Slack } from "lucide-react";
import { FooterButton } from "../../ui/footer-button";
import { ProjectDescriptionText } from "../../ui/project-description-text";

const FooterDd2030 = () => {
  return (
    <div className="w-full bg-[#F1F6F8] px-6 py-6 md:py-10">
      <div className="w-full max-w-[1024px] mx-auto bg-white rounded-3xl md:rounded-[32px] p-8 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:gap-8">
          {/* ロゴエリア */}
          <div className="flex justify-center md:justify-start mb-8 md:mb-0 md:flex-shrink-0">
            <div className="w-64 h-[81px] flex items-center justify-center">
              <div className="flex items-center gap-[11.68px]">
                {/* ロゴマーク部分 */}
                <img
                  src="/images/dd2030-logomark.svg"
                  alt="idobata ロゴマーク"
                  className="w-[75px] h-[81px]"
                />
                {/* ロゴタイプ部分 */}
                <img
                  src="/images/dd2030-logotype.svg"
                  alt="idobata"
                  className="w-[84px] h-[74px]"
                />
              </div>
            </div>
          </div>

          {/* 情報エリア */}
          <div className="flex-1 space-y-4">
            {/* 説明テキスト */}
            <ProjectDescriptionText className="text-[#27272A]">
              このサイトは、話し合いや合意形成のための idobata で動いています。
            </ProjectDescriptionText>

            {/* ボタンエリア */}
            <div className="flex flex-wrap gap-3">
              {/* プロジェクトサイトボタン */}
              <FooterButton asChild>
                <a
                  href="https://dd2030.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  プロジェクトサイト
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </FooterButton>

              {/* Xボタン */}
              <FooterButton asChild>
                <a
                  href="https://x.com/dd2030jp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <img
                    src="/images/x-icon.svg"
                    alt="X (Twitter)"
                    className="w-3 h-3"
                  />
                </a>
              </FooterButton>

              {/* noteボタン */}
              <FooterButton asChild>
                <a
                  href="https://note.com/dd2030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <img
                    src="/images/note-icon.svg"
                    alt="note"
                    className="w-10 h-2"
                  />
                </a>
              </FooterButton>

              {/* Slackボタン */}
              <FooterButton asChild>
                <a
                  href="https://join.slack.com/t/dd2030/shared_invite/zt-35bjj11ms-OQtx4Lu08LJ4OqWiRAgNrA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Slack className="w-4 h-4" />
                  slack
                </a>
              </FooterButton>

              {/* GitHubボタン */}
              <FooterButton asChild>
                <a
                  href="https://github.com/digitaldemocracy2030"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              </FooterButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterDd2030;
