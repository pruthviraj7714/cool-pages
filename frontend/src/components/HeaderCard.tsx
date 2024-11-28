import { Card, CardHeader, CardContent } from "@/components/ui/card";
import React, { useState, useMemo } from "react";

interface ButtonType {
  displayText: string;
  leftClickOutput?: string;
  rightClickOutput?: string;
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
  handleHeaderClick: (header: HeaderType) => void;
  handleSubHeaderClick: (header: HeaderType, subheader: SubheaderType) => void;
}

const ButtonWithSubOptions: React.FC<{
  btn: ButtonType;
  buttonId: string;
  level?: number;
  parentPath?: string[];
  handleLeftClick: (btn: ButtonType, e: React.MouseEvent) => void;
  handleRightClick: (btn: ButtonType, e: React.MouseEvent) => void;
}> = ({
  btn, 
  buttonId, 
  level = 0, 
  parentPath = [], 
  handleLeftClick,
  handleRightClick
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<{
    type: 'left' | 'right' | null,
    open: boolean
  }>({
    type: null,
    open: false
  });

  const currentPath = useMemo(() => [...parentPath, btn.displayText], [parentPath, btn.displayText]);

  const handleButtonClick = (
    e: React.MouseEvent, 
    isRightClick: boolean = false
  ) => {
    e.preventDefault();
    
    const handler = isRightClick ? handleRightClick : handleLeftClick;
    const subOptions = isRightClick 
      ? btn.rightClickSubOptions 
      : btn.leftClickSubOptions;

    handler(btn, e);

    setActiveSubmenu(prev => ({
      type: isRightClick ? 'right' : 'left',
      open: subOptions && subOptions.length > 0 
        ? !prev.open 
        : false
    }));
  };

  return (
    <div className="relative button-container">
      <button
        className={`border border-black px-1 py-1 rounded-md hover:bg-gray-200 ${
          level > 0 ? "ml-4" : ""
        }`}
        onClick={(e) => handleButtonClick(e, false)}
        onContextMenu={(e) => handleButtonClick(e, true)}
        disabled={!btn.leftClickSubOptions && !btn.rightClickSubOptions}
      >
        {btn.displayText}
      </button>

      {activeSubmenu.type === 'left' && 
       activeSubmenu.open && 
       btn.leftClickSubOptions && (
        <div className="absolute mt-2 flex flex-col bg-white border border-gray-200 shadow-md rounded-md z-10 left-0 min-w-max">
          {btn.leftClickSubOptions.map((subBtn, index) => (
            <ButtonWithSubOptions
              key={`${buttonId}-left-${index}`}
              btn={subBtn}
              buttonId={`${buttonId}-left-${index}`}
              level={level + 1}
              parentPath={[...currentPath, "left"]}
              handleLeftClick={handleLeftClick}
              handleRightClick={handleRightClick}
            />
          ))}
        </div>
      )}

      {activeSubmenu.type === 'right' && 
       activeSubmenu.open && 
       btn.rightClickSubOptions && (
        <div className="absolute mt-2 flex flex-col bg-white border border-gray-200 shadow-md rounded-md z-10 right-0 min-w-max">
          {btn.rightClickSubOptions.map((subBtn, index) => (
            <ButtonWithSubOptions
              key={`${buttonId}-right-${index}`}
              btn={subBtn}
              buttonId={`${buttonId}-right-${index}`}
              level={level + 1}
              parentPath={[...currentPath, "right"]}
              handleLeftClick={handleLeftClick}
              handleRightClick={handleRightClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function HeaderCard({
  header,
  handleLeftClick,
  handleRightClick,
  handleHeaderClick,
  handleSubHeaderClick,
}: HeaderCardProps) {
  return (
    <Card className="w-full bg-gray-50 shadow-md rounded-md">
      <CardHeader>
        <h2
          className="text-3xl font-bold cursor-pointer"
          onClick={() => handleHeaderClick(header)}
        >
          {header?.title}
        </h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {header.subheaders
            ?.sort((a, b) => a.order - b.order)
            .map((subheader) => (
              <div key={subheader.title}>
                <h3
                  className="ml-4 text-3xl mb-5 font-semibold cursor-pointer"
                  onClick={() => handleSubHeaderClick(header, subheader)}
                >
                  {subheader.title}
                </h3>
                {subheader.buttons && (
                  <div className="ml-6 mt-2 flex gap-3">
                    {subheader.buttons.map((btn, index) => (
                      <div
                        key={`subheader-${subheader.title}-${btn.displayText}-${index}`}
                      >
                        <ButtonWithSubOptions
                          btn={btn}
                          buttonId={`subheader-${subheader.title}-${index}`}
                          handleLeftClick={handleLeftClick}
                          handleRightClick={handleRightClick}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          {header.buttons && (
            <div className="flex gap-3">
              {header.buttons.map((btn, index) => (
                <div key={`header-${btn.displayText}-${index}`}>
                  <ButtonWithSubOptions
                    btn={btn}
                    buttonId={`header-${index}`}
                    handleLeftClick={handleLeftClick}
                    handleRightClick={handleRightClick}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}