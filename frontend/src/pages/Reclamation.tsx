import { Tab } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import { useMemo, useState, useEffect, type ReactNode, useCallback } from "react";

import { triggerManage } from "../api/manageTrigger";
import { reclamationRandomApi, reclamationByNameApi } from "../api/reclamation";
import type { ReclamationInterface } from "../api/reclamation";

import { VerseControls } from "../components/VerseControls";
import { VerseBox } from "../components/VerseBox";
import { ThemeSwitcher } from "../theme/ThemeSwitcher";
import { TypewriterRepeat } from "../components/TypewriterRepeat";

import { TabbedPageShell } from "../components/TabbedPageShell";
import { PaneFrame } from "../components/PaneFrame";
import { Signature } from "../components/Signature";

type TabKey = "shadow";

export const ReclamationPage = () => {
  const navigate = useNavigate();
  const { html_name } = useParams<{ html_name?: string }>();

  const [data, setData] = useState<ReclamationInterface | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = html_name
        ? await reclamationByNameApi(html_name)
        : await reclamationRandomApi();

      setData(d);

      const got = d?.reclamation?.html_name;
      if (!html_name && got) {
        navigate(`/reclamation/${got}`, { replace: true });
      }
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [html_name, navigate]);

  useEffect(() => {
    void load();
  }, [load]);

  const signature: ReactNode = useMemo(() => <Signature />, []);

  const onPrev = useCallback(() => triggerManage("prev"), []);
  const onNext = useCallback(() => triggerManage("next"), []);

  const controls = useMemo(
    () => (
      <VerseControls
        tagText={data?.reclamation?.text ?? "…"}
        prevText="сюда"
        nextText="туда"
        onTop={load}
        onPrev={onPrev}
        onNext={onNext}
      />
    ),
    [data?.reclamation?.text, load, onPrev, onNext]
  );

  const bottomBlock: ReactNode = useMemo(
    () => (
      <>
        {controls}
        {signature}
      </>
    ),
    [controls, signature]
  );

  const showNoData = !loading && !data;

  return (
    <TabbedPageShell<TabKey>
      id="reclamation-tabs"
      activeKey="shadow"
      onSelect={() => {}}
      toolsRight={<ThemeSwitcher />}
      tabs={[{ key: "shadow", title: "тень" }]}
    >
      <Tab.Pane eventKey="shadow">
        <PaneFrame loading={loading} empty={showNoData} emptyNode={<div>no data</div>}>
          <VerseBox
            textMd={
              <TypewriterRepeat
                markdown={data?.answer?.text ?? ""}
                repeat={data?.answer?.repeat ?? 1}
                msPerChar={65}
              />
            }
            childrenBottom={bottomBlock}
          />
        </PaneFrame>
      </Tab.Pane>
    </TabbedPageShell>
  );
};
