import { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import { verse } from "../api/verse.ts";
import type { VerseInterface } from "../api/verse.ts";
import { SquareButton } from "../components/SquareButton.tsx";
import { VerseBox } from "../components/VerseBox.tsx";
import "./Verse.css";

export const Verse = () => {
  const [status, setStatus] = useState<string>("current");
  const [vrs, setVrs] = useState<VerseInterface | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await verse(status);
        // reset status
        setStatus("current");
        // save data
        if (data) setVrs(data);
      } catch (e) {
        console.log(e);
      } finally {
        // reset loading
        setLoading(false);
      }
    };

    load();
  }, [status]);

  const newVerse = (newStatus: string) => {
    setStatus(newStatus);
  };

  console.log(`status within Verse: ${status}`);

  if (loading || !vrs) return <div>No text, wait...</div>;

  return (
    <VerseBox
      titleMd={vrs.title}
      textMd={vrs.text}
      author="Евгений Проскуликов"
      tag1Text="голос"
      tag2Text="герменевтика"
      tag3Text="Это не поэзия"
      prevText="сюда"
      nextText="туда"
      onPrev={() => newVerse("prev")}
      onNext={() => newVerse("next")}
    />
  );
};
