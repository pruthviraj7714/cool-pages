import { Button } from "./ui/button";

export default function ButtonComponent({
  btn,
  handleLeftClick,
  handleRightClick,
}: {
  btn: any;
  handleLeftClick: (btn: any, e: React.MouseEvent) => void;
  handleRightClick: (btn: any, e: React.MouseEvent) => void;
}) {
  return (
    <div>
      <Button
        onClick={(e) => handleLeftClick(btn, e)}
        onContextMenu={(e) => handleRightClick(btn, e)}
        className="bg-blue-500 text-white hover:bg-blue-600"
      >
        {btn.displayText}
      </Button>
    </div>
  );
}
