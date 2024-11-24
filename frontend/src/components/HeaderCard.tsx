import { useState } from "react";
import ButtonComponent from "./ButtonComponent"; 

export default function HeaderCard({
  header,
  handleLeftClick,
  handleRightClick,
}: {
  header: any;
  handleLeftClick: (btn: any, e: React.MouseEvent) => void;
  handleRightClick: (btn: any, e: React.MouseEvent) => void;
}) {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);


  const toggleDropdown = (buttonId: string) => {
    setShowDropdown(showDropdown === buttonId ? null : buttonId);
  };

  return (
    <div key={header.title} className="space-y-3">
      <div className="text-3xl font-bold">{header.title}</div>

      <section className="space-y-3 pl-4">
        {header.subheaders &&
          header.subheaders
            .sort((a, b) => a.order - b.order)
            .map((subheader) => (
              <div key={subheader.title} className="space-y-2 border border-black w-[120px] flex justify-center items-center cursor-pointer rounded-md">
                <div className="text-lg font-semibold">
                  {subheader.title}
                </div>
                <div className="flex flex-wrap gap-2">
                  {subheader.buttons &&
                    subheader.buttons.map((btn, index) => (
                      <ButtonComponent
                        key={index}
                        btn={btn}
                        handleLeftClick={handleLeftClick}
                        handleRightClick={handleRightClick}
                      />
                    ))}
                </div>
              </div>
            ))}
      </section>

      <div className="flex flex-wrap gap-2">
        {header.buttons &&
          header.buttons.map((btn, index) => (
            <ButtonComponent
              key={index}
              btn={btn}
              handleLeftClick={handleLeftClick}
              handleRightClick={handleRightClick}
            />
          ))}
      </div>

      {showDropdown && (
        <div
          className="absolute bg-white shadow-lg border rounded-lg p-4 space-y-2 w-48"
          style={{ left: '100%', top: '0' }}
        >

          {header.buttons
            ?.flatMap((btn) => btn.leftClickSubOptions || [])
            .map((option, index) => (
              <ButtonComponent
                key={index}
                btn={option}
                handleLeftClick={handleLeftClick}
                handleRightClick={handleRightClick}
              />
            ))}

          {header.buttons
            ?.flatMap((btn) => btn.rightClickSubOptions || [])
            .map((option, index) => (
              <ButtonComponent
                key={index}
                btn={option}
                handleLeftClick={handleLeftClick}
                handleRightClick={handleRightClick}
              />
            ))}
        </div>
      )}
    </div>
  );
}