import { useEffect } from "react";

const SITE_NAME = "BidX";

/**
 * Sets the document title for the current page.
 * Appends the site name: "Page Title | Online Auction"
 * Resets to default on unmount.
 */
export const useDocumentTitle = (title) => {
  useEffect(() => {
    const prev = document.title;
    if (!title) {
      document.title = SITE_NAME;
    } else if (title.includes(SITE_NAME)) {
      document.title = title;
    } else {
      document.title = `${title} | ${SITE_NAME}`;
    }
    return () => {
      document.title = prev;
    };
  }, [title]);
};
