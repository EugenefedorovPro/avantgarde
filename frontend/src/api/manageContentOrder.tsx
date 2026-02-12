import { useState, useEffect } from "react";
import { fetchContentOrder } from "./fetchContentOrder";
import type { ContentOrderInterface } from "./fetchContentOrder";
import { Verse } from "../pages/Verse";

export const ManageContentOrder = () => {
  const [data, setData] = useState<ContentOrderInterface | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const content = await fetchContentOrder("10", "next");
        if (content) {
          setData(content);
        }
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, []);

  if (data) {
    <Verse initialVerseOrder={data.order} initialStatus="current" />;
  }
};
