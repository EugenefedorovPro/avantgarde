import { Tab, Nav } from "react-bootstrap";
import type { ReactNode } from "react";

export type TabDef<K extends string> = {
  key: K;
  title: ReactNode;
  disabled?: boolean;
};

type Props<K extends string> = {
  id: string;
  activeKey: K;
  onSelect: (k: K) => void;
  tabs: Array<TabDef<K>>;
  toolsRight?: ReactNode; // e.g. <ThemeSwitcher />
  children: ReactNode;    // Tab.Pane elements
};

export function TabbedPageShell<K extends string>({
  id,
  activeKey,
  onSelect,
  tabs,
  toolsRight,
  children,
}: Props<K>) {
  return (
    <Tab.Container
      id={id}
      activeKey={activeKey}
      onSelect={(k) => k && onSelect(k as K)}
    >
      <Nav variant="tabs" className="custom-tabs tabsWithTools">
        {tabs.map((t) => (
          <Nav.Item key={t.key}>
            <Nav.Link eventKey={t.key} disabled={t.disabled}>
              {t.title}
            </Nav.Link>
          </Nav.Item>
        ))}

        <Nav.Item className="ms-auto d-flex align-items-center">
          <div className="tabsTool">{toolsRight}</div>
        </Nav.Item>
      </Nav>

      <Tab.Content>{children}</Tab.Content>
    </Tab.Container>
  );
}
