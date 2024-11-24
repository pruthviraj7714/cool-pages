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

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
      textboxRef.current!.value = history[currentIndex - 1];
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      textboxRef.current!.value = history[currentIndex + 1];
    }
  };

  const handleReset = () => {
    textboxRef.current!.value = "";
    setHistory([""]);
    setCurrentIndex(0);
  };

  const handleCopy = () => {
    if (textboxRef.current) {
      navigator.clipboard.writeText(textboxRef.current.value).then(() => {
        alert("Text copied to clipboard!");
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

  const handleLeftClick = (btn: ButtonSchema, e: React.MouseEvent) => {
    e.preventDefault();
    if (textboxRef.current && btn.onLeftClickOutput) {
      textboxRef.current.value = btn.onLeftClickOutput;
    }
  };

  const handleRightClick = (btn: ButtonSchema, e: React.MouseEvent) => {
    e.preventDefault();
    if (textboxRef.current && btn.onRightClickOutput) {
      textboxRef.current.value = btn.onRightClickOutput;
    }
  };

  useEffect(() => {
    if (pageId) {
      fetchPageDetails();
    }
  }, [pageId]);

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
        <section className="w-full grid grid-cols-4 gap-3">
          {pageDetails?.headers
            ?.sort((a, b) => a.order - b.order)
            .map((header : any) => (
              <HeaderCard key={header._id} header={header} handleLeftClick={handleLeftClick} handleRightClick={handleRightClick}  />
            ))}
        </section>
      </div>

      <div className="fixed flex right-0 bottom-10 gap-2 p-2">
        <div className="flex flex-col gap-2">
          <button
            onClick={handleUndo}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={currentIndex === 0}
          >
            Undo
          </button>
          <button
            onClick={handleRedo}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
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
            className="w-full h-full p-4  bg-slate-200"
          />
        </div>
      </div>
    </div>
  );
}

export default PageDetails;
