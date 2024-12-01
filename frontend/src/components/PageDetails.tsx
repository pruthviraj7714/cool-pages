import { BACKEND_URL } from "@/config/config";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import HeaderCard from "./HeaderCard";

interface ButtonSchema {
  displayText: string;
  headerId?: string;
  subheaderId?: string;
  onLeftClickOutput?: string;
  onRightClickOutput?: string;
  leftClickSubOptions?: ButtonSchema[];
  rightClickSubOptions?: ButtonSchema[];
}

interface SubHeaderSchema {
  title: string;
  order: number;
  buttons?: ButtonSchema[];
}

interface HeaderSchema {
  title: string;
  displayText: string;
  order: number;
  subheaders?: SubHeaderSchema[];
  buttons?: ButtonSchema[];
}

interface PageSchema {
  title: string;
  headers?: HeaderSchema[];
}

function PageDetails() {
  const { pageId } = useParams();
  const navigate = useNavigate();
  const textboxRef = useRef<HTMLTextAreaElement | null>(null);

  if (!pageId) {
    navigate("/dashboard");
  }

  const [pageDetails, setPageDetails] = useState<PageSchema | null>(null);
  const [loading, setLoading] = useState(true);

  const [history, setHistory] = useState<string[]>([""]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isUndoRedoAction, setIsUndoRedoAction] = useState(false);

  const updateHistory = (newText: string) => {
    if (isUndoRedoAction) {
      setIsUndoRedoAction(false);
      return;
    }

    if (newText !== history[currentIndex]) {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(newText);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
    }
  };

  const handleHeaderClick = (header: HeaderSchema) => {
    if (!textboxRef.current) return;

    const text = textboxRef.current.value.trim();

    if (text.includes(header.displayText)) return;

    const lines = text.split("\n").filter((line) => line.trim() !== "");

    const headerSubheadersMap = new Map();

    let currentHeader = null;

    for (const line of lines) {
      if (!line.startsWith("  ")) {
        currentHeader = line.trim().replace(":", "");
        headerSubheadersMap.set(currentHeader, []);
      } else if (currentHeader) {
        headerSubheadersMap.get(currentHeader).push(line);
      }
    }

    if (!headerSubheadersMap.has(header.displayText)) {
      headerSubheadersMap.set(header.displayText, []);
    }

    const sortedHeaders =
      pageDetails?.headers?.sort((a, b) => a.order - b.order) || [];

    const updatedLines = [];
    for (const sortedHeader of sortedHeaders) {
      if (headerSubheadersMap.has(sortedHeader.displayText)) {
        updatedLines.push(`${sortedHeader.displayText}:`);
        updatedLines.push(
          ...(headerSubheadersMap.get(sortedHeader.displayText) || [])
        );
      }
    }

    textboxRef.current.value = updatedLines.join("\n").trim();
  };

  const handleSubHeaderClick = (
    header: HeaderSchema,
    subheader: SubHeaderSchema
  ) => {
    if (!textboxRef.current || !header || !subheader) return;
  
    const text = textboxRef.current.value;
    const lines = text.split("\n");
  
    // If the subheader already exists, do nothing
    if (text.includes(`${subheader.title}:`)) return;
  
    // Find the index of the header
    const headerIndex = lines.findIndex((line) =>
      line.trim().startsWith(header.displayText)
    );
  
    if (headerIndex === -1) {
      // Header doesn't exist, add the subheader as a new line
      lines.push(`${subheader.title}:`);
    } else {
      // Find the next header's index or end of the text
      const nextHeaderIndex = lines.findIndex(
        (line, index) => index > headerIndex && !line.startsWith("  ")
      );
  
      // Extract existing subheaders under this header
      const existingSubheaders = lines
        .slice(
          headerIndex + 1,
          nextHeaderIndex === -1 ? undefined : nextHeaderIndex
        )
        .map((line) => line.trim().replace(":", ""));
  
      // Ensure the new subheader is added
      if (!existingSubheaders.includes(subheader.title)) {
        existingSubheaders.push(subheader.title);
      }
  
      // Sort subheaders according to the header's subheader order
      const sortedSubheaders = (header.subheaders || [])
        .sort((a, b) => a.order - b.order)
        .filter((sh) => existingSubheaders.includes(sh.title))
        .map((sh) => `  ${sh.title}:`);
  
      // Replace the existing subheader lines with the updated and sorted subheaders
      lines.splice(
        headerIndex + 1,
        nextHeaderIndex === -1 ? lines.length - headerIndex - 1 : nextHeaderIndex - headerIndex - 1,
        ...sortedSubheaders
      );
    }
  
    // Update the textbox value and trigger the history update
    textboxRef.current.value = lines.join("\n");
    updateHistory(textboxRef.current.value);
  };

  const handleLeftClick = (btn: ButtonSchema, e: React.MouseEvent) => {
    e.preventDefault();
    if (!textboxRef.current) return;

    console.log(textboxRef.current.value);
    if (textboxRef.current.value.includes(btn?.onLeftClickOutput as string))
      return;

    const text = textboxRef.current.value;
    const lines = text.split("\n");
    const buttonText = btn?.onLeftClickOutput;

    if (buttonText) {
      const header = pageDetails?.headers?.find((h) =>
        //@ts-ignore
        h._id === btn.headerId
      );
      const subheader = pageDetails?.headers
        ?.flatMap((h) => h.subheaders || [])
        //@ts-ignore
        .find((sh) => sh._id === btn.subheaderId);

      if (subheader) {
        const parentHeader = pageDetails?.headers?.find((h) =>
          h.subheaders?.includes(subheader)
        );

        if (parentHeader) {
          const headerText = parentHeader.displayText;
          const subheaderText = subheader.title;

          const subheaderIndex = lines.findIndex((line) =>
            line.trim().includes(`${subheaderText}:`)
          );

          if (subheaderIndex !== -1) {
            lines[subheaderIndex] += ` ${buttonText};`;
          } else {
            const headerIndex = lines.findIndex(
              (line) => line.trim() === `${headerText}:`
            );

            if (headerIndex !== -1) {
              lines.splice(
                headerIndex + 1,
                0,
                `  ${subheaderText}: ${buttonText};`
              );
            } else {
              lines.push(`${buttonText};`);
            }
          }
        }
      } else if (header) {
        const headerText = header.displayText;
        const headerIndex = lines.findIndex(
          (line) => line.trim() === `${headerText}:`
        );

        if (headerIndex !== -1) {
          lines[headerIndex] += ` ${buttonText};`;
        } else {
          lines.push(`${buttonText};`);
        }
      } else {
        if (buttonText) {
          lines.push(buttonText) + ";";
        }
      }

      textboxRef.current.value = lines.join("\n");
    }

    updateHistory(textboxRef.current.value);
  };

  const handleRightClick = (btn: ButtonSchema) => {
    document.addEventListener("contextmenu", (event) => event.preventDefault());

    if (!textboxRef.current) return;

    if (textboxRef.current.value.includes(btn?.onRightClickOutput as string))
      return;

    const text = textboxRef.current.value;
    if (text.includes(btn.displayText)) return;
    const buttonText = btn?.onRightClickOutput;

    if (buttonText) {
      const header = pageDetails?.headers?.find((h) =>
        //@ts-ignore
        h._id === btn.headerId
      );
      const subheader = pageDetails?.headers
        ?.flatMap((h) => h.subheaders || [])
        //@ts-ignore
        .find((sh) => sh._id === btn.subheaderId);

      const lines = text.split("\n");

      if (subheader) {
        const parentHeader = pageDetails?.headers?.find((h) =>
          h.subheaders?.includes(subheader)
        );

        if (parentHeader) {
          const headerText = parentHeader.displayText;
          const subheaderText = subheader.title;

          const subheaderIndex = lines.findIndex((line) =>
            line.trim().includes(`${subheaderText}`)
          );

          if (subheaderIndex !== -1) {
            lines[subheaderIndex] += `${buttonText};`;
          } else {
            const headerIndex = lines.findIndex(
              (line) => line.trim() === `${headerText}:`
            );

            if (headerIndex !== -1) {
              lines.splice(
                headerIndex + 1,
                0,
                `  ${subheaderText}: ${buttonText};`
              );
            } else {
              lines.push(`${buttonText};`);
            }
          }
        }
      } else if (header) {
        const headerText = header.displayText;
        const headerIndex = lines.findIndex(
          (line) => line.trim() === `${headerText}:`
        );

        if (headerIndex !== -1) {
          lines[headerIndex] = `${headerText}: ${buttonText};`;
        } else {
          lines.push(`${buttonText};`);
        }
      } else {
        lines.push(buttonText + ";");
      }
      textboxRef.current.value = lines.join("\n");
    }
    updateHistory(textboxRef.current.value);
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setIsUndoRedoAction(true);
      setCurrentIndex((prevIndex) => prevIndex - 1);
      if (textboxRef.current) {
        textboxRef.current.value = history[currentIndex - 1];
        textboxRef.current.focus();
        textboxRef.current.setSelectionRange(
          textboxRef.current.value.length,
          textboxRef.current.value.length
        );
      }
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setIsUndoRedoAction(true);
      setCurrentIndex((prevIndex) => prevIndex + 1);
      if (textboxRef.current) {
        textboxRef.current.value = history[currentIndex + 1];
        textboxRef.current.focus();
        textboxRef.current.setSelectionRange(
          textboxRef.current.value.length,
          textboxRef.current.value.length
        );
      }
    }
  };

  const handleReset = () => {
    const emptyText = "";
    if (textboxRef.current) {
      textboxRef.current.value = emptyText;
      textboxRef.current.focus();
    }
    setHistory([emptyText]);
    setCurrentIndex(0);
  };

  const handleCopy = () => {
    if (textboxRef.current) {
      navigator.clipboard.writeText(textboxRef.current.value).then(() => {
        toast.success("Text copied to clipboard!");
      });
    }
  };

  const fetchPageDetails = async () => {
    if (!pageId) return;
    try {
      setLoading(true);
      const res = await axios.get(
        `${BACKEND_URL}/pages/page-details/${pageId}`
      );
      setPageDetails(res.data.page);
    } catch (error) {
      toast.error("Error while fetching page details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pageId) {
      fetchPageDetails();
    }
  }, [pageId]);

  useEffect(() => {
    const textbox = textboxRef.current;
    if (!textbox) return;

    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      updateHistory(target.value);
    };

    textbox.addEventListener("input", handleInput);
    return () => textbox.removeEventListener("input", handleInput);
  }, [currentIndex, history]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, history]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center animate-spin">
        <Loader2 size={35} />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex flex-col items-start space-y-6 p-6 rounded-lg h-screen">
        <h1 className="text-2xl font-bold text-gray-800">
          Title: {pageDetails?.title}
        </h1>
        <section className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
          {pageDetails?.headers
            ?.sort((a, b) => a.order - b.order)
            .map((header: HeaderSchema) => (
              <HeaderCard
                key={header.displayText}
                header={header}
                handleLeftClick={handleLeftClick}
                handleRightClick={handleRightClick}
                //@ts-ignore
                handleHeaderClick={(header: HeaderSchema) => {
                  handleHeaderClick(header);
                }}
                //@ts-ignore
                handleSubHeaderClick={(
                  header: HeaderSchema,
                  subheader: SubHeaderSchema
                ) => {
                  handleSubHeaderClick(header, subheader);
                }}
              />
            ))}
        </section>
      </div>

      <div className="fixed flex right-0 bottom-10 gap-2 p-2">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUndo}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === 0}
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentIndex === history.length - 1}
          >
            Redo
          </button>
          <button
            onClick={handleReset}
            className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset
          </button>
          <button
            onClick={handleCopy}
            className="p-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            Copy
          </button>
        </div>

        <div className="flex-grow w-[350px] h-[300px]">
          <textarea
            autoFocus
            ref={textboxRef}
            placeholder="Text will appear here"
            className="w-full h-full p-4 bg-slate-200 font-semibold resize-non"
          />
        </div>
      </div>
    </div>
  );
}

export default PageDetails;
