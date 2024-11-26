import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface ButtonType {
  displayText: string;
  onLeftClickOutput?: string;
  onRightClickOutput?: string;
  leftClickSubOptions?: ButtonType[];
  rightClickSubOptions?: ButtonType[];
}

interface SubheaderType {
  title: string;
  order: number;
  buttons?: ButtonType[];
}

interface HeaderType {
  title: string;
  subheaders?: SubheaderType[];
  buttons?: ButtonType[];
}

interface HeaderCardProps {
  header: HeaderType;
  handleLeftClick: (btn: ButtonType, e: React.MouseEvent) => void;
  handleRightClick: (btn: ButtonType, e: React.MouseEvent) => void;
}

export default function HeaderCard({
  header,
  handleLeftClick,
  handleRightClick,
}: HeaderCardProps) {
  const [activeMenuPath, setActiveMenuPath] = useState<string[]>([]);
  const [activeButtonId, setActiveButtonId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".button-container")) {
        setActiveMenuPath([]);
        setActiveButtonId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSubmenuActive = (buttonId: string, path: string[]): boolean => {
    return (
      activeButtonId === buttonId &&
      path.every((item, index) => activeMenuPath[index] === item)
    );
  };

  const handleButtonClick = (
    btn: ButtonType,
    buttonId: string,
    e: React.MouseEvent,
    currentPath: string[],
    isRightClick: boolean = false
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const subOptions = isRightClick
      ? btn.rightClickSubOptions
      : btn.leftClickSubOptions;
    const handler = isRightClick ? handleRightClick : handleLeftClick;

    handler(btn, e);

    if (subOptions && subOptions.length > 0) {
      const newPath = [
        ...currentPath,
        btn.displayText,
        isRightClick ? "right" : "left",
      ];
      if (isSubmenuActive(buttonId, newPath)) {
        setActiveMenuPath(activeMenuPath.slice(0, currentPath.length));
        setActiveButtonId(null);
      } else {
        setActiveMenuPath(newPath);
        setActiveButtonId(buttonId);
      }
    } else {
      setActiveMenuPath([]);
      setActiveButtonId(null);
    }
  };

  const renderButtonWithSubOptions = (
    btn: ButtonType,
    buttonId: string,
    level: number = 0,
    parentPath: string[] = []
  ): JSX.Element => {
    const currentPath = [...parentPath, btn.displayText];
    const isLeftSubmenuOpen = isSubmenuActive(buttonId, [
      ...currentPath,
      "left",
    ]);
    const isRightSubmenuOpen = isSubmenuActive(buttonId, [
      ...currentPath,
      "right",
    ]);

    return (
      <div className="relative button-container">
        <button
          className={`border border-black px-1 py-1 rounded-md hover:bg-gray-200 ${
            level > 0 ? "ml-4" : ""
          }`}
          onClick={(e) => handleButtonClick(btn, buttonId, e, parentPath)}
          onContextMenu={(e) =>
            handleButtonClick(btn, buttonId, e, parentPath, true)
          }
        >
          {btn.displayText}
        </button>

        {isLeftSubmenuOpen && btn.leftClickSubOptions && (
          <div className="absolute mt-2 flex flex-col bg-white border border-gray-200 shadow-md rounded-md z-10 left-0 min-w-max">
            {btn.leftClickSubOptions.map((subBtn, index) => (
              <div key={`left-${index}`}>
                {renderButtonWithSubOptions(
                  subBtn,
                  `${buttonId}-left-${index}`,
                  level + 1,
                  [...currentPath, "left"]
                )}
              </div>
            ))}
          </div>
        )}

        {isRightSubmenuOpen && btn.rightClickSubOptions && (
          <div className="absolute mt-2 flex flex-col bg-white border border-gray-200 shadow-md rounded-md z-10 right-0 min-w-max">
            {btn.rightClickSubOptions.map((subBtn, index) => (
              <div key={`right-${index}`}>
                {renderButtonWithSubOptions(
                  subBtn,
                  `${buttonId}-right-${index}`,
                  level + 1,
                  [...currentPath, "right"]
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full bg-gray-50 shadow-md rounded-md">
      <CardHeader>
        <h2 className="text-3xl font-bold">{header.title}</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {header.subheaders
            ?.sort((a, b) => a.order - b.order)
            .map((subheader) => (
              <div key={subheader.title}>
                <h3 className="ml-4 text-3xl mb-5 font-semibold">
                  {subheader.title}
                </h3>
                {subheader.buttons && (
                  <div className="ml-6 mt-2 flex gap-3">
                    {subheader.buttons.map((btn, index) => (
                      <div key={index}>
                        {renderButtonWithSubOptions(
                          btn,
                          `subheader-${subheader.title}-${index}`
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          {header.buttons && (
            <div className="flex gap-3">
              {header.buttons.map((btn, index) => (
                <div key={index}>
                  {renderButtonWithSubOptions(btn, `header-${index}`)}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
