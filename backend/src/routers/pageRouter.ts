import { Request, Response, Router } from "express";
import authMiddleware from "../middleware";
import { Button, Header, Page } from "../models/page";
import { z } from "zod";
import { Subheader } from "../models/subheader";

export const pageRouter = Router();

async function createButton(
  buttonData: any,
  parentRef: any,
  parentType: "header" | "subheader"
) {
  const createdButton = await Button.create({
    displayText: buttonData.displayText,
    leftClickSubOptions: [],
    rightClickSubOptions: [],
    onLeftClickOutput: buttonData.onLeftClickOutput,
    onRightClickOutput: buttonData.onRightClickOutput,
    ...(parentType === "header" && { headerRef: parentRef }),
    ...(parentType === "subheader" && { subheaderRef: parentRef }),
  });

  if (buttonData.leftClickSubOptions && buttonData.leftClickSubOptions.length > 0) {
    const leftClickPromises = buttonData.leftClickSubOptions.map((subButton: any) =>
      createButton(subButton, createdButton._id, "subheader")
    );
    const createdLeftClickSubOptions = await Promise.all(leftClickPromises);

    createdButton.leftClickSubOptions = createdLeftClickSubOptions.map((b) => b._id);
  }

  if (buttonData.rightClickSubOptions && buttonData.rightClickSubOptions.length > 0) {
    const rightClickPromises = buttonData.rightClickSubOptions.map((subButton: any) =>
      createButton(subButton, createdButton._id, "subheader")
    );
    const createdRightClickSubOptions = await Promise.all(rightClickPromises);

    createdButton.rightClickSubOptions = createdRightClickSubOptions.map((b) => b._id);
  }

  await createdButton.save();

  return createdButton;
}

pageRouter.post(
  "/create-page",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { title, headers } = req.body.data;

      const page = await Page.create({
        title,
        headers: [],
      });

      if (headers && headers.length > 0) {
        const headerPromises = headers.map(async (header: any) => {
          const createdHeader = await Header.create({
            title: header.title,
            order: header.order,
            pageRef: page._id,
            subheaders: [],
            buttons: [],
          });

          page.headers.push(createdHeader._id);

          if (header.subheaders) {
            const subheaderPromises = header.subheaders.map(
              async (subheader: any) => {
                const createdSubheader = await Subheader.create({
                  title: subheader.title,
                  order: subheader.order,
                  headerRef: createdHeader._id,
                  buttons: [],
                });

                createdHeader.subheaders.push(createdSubheader._id);

                if (subheader.buttons) {
                  const subheaderButtonPromises = subheader.buttons.map(
                    async (button: any) => {
                      const createdButton = await createButton(
                        button,
                        createdSubheader._id,
                        "subheader"
                      );
                      createdSubheader.buttons.push(createdButton._id); 
                    }
                  );
                  await Promise.all(subheaderButtonPromises);

                  await createdSubheader.save(); 
                }

                return createdSubheader;
              }
            );

            await Promise.all(subheaderPromises);
          }

          if (header.buttons) {
            const headerButtonPromises = header.buttons.map(
              async (button: any) => {
                const createdButton = await createButton(
                  button,
                  createdHeader._id,
                  "header"
                );
                createdHeader.buttons.push(createdButton._id);
              }
            );
            await Promise.all(headerButtonPromises);
          }

          await createdHeader.save();
          return createdHeader;
        });

        await Promise.all(headerPromises);
      }

      await page.save();

      const populatedPage = await Page.findById(page._id).populate({
        path: "headers",
        populate: [
          {
            path: "buttons",
            populate: [
              { path: "leftClickSubOptions" },
              { path: "rightClickSubOptions" },
            ],
          },
          {
            path: "subheaders",
            populate: {
              path: "buttons",
              populate: [
                { path: "leftClickSubOptions" },
                { path: "rightClickSubOptions" },
              ],
            },
          },
        ],
      });

      return res.status(201).json({
        message: "Page created successfully.",
        page: populatedPage,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: "Validation failed.",
          errors: error.errors,
        });
      }
      console.error("Error saving page:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  }
);

// pageRouter.post(
//   "/add-header",
//   authMiddleware,
//   async (req: Request, res: Response): Promise<any> => {
//     const parsedBody = createHeaderSchema.safeParse(req.body);
//     if (!parsedBody.success) {
//       return res.status(400).json({
//         message: "Invalid Inputs",
//         error: parsedBody.error.format(),
//       });
//     }

//     const { title, pageId, order } = parsedBody.data;

//     try {
//       const page = await Page.findById(pageId);
//       if (!page) {
//         return res.status(404).json({ message: "Page not found!" });
//       }

//       const header = await Header.create({ title, order, pageRef: page._id });
//       page.headers.push(header._id);
//       await page.save();

//       return res.status(201).json({
//         message: "Header successfully created",
//         header,
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

// pageRouter.post(
//   "/add-subheader",
//   authMiddleware,
//   async (req: Request, res: Response): Promise<any> => {
//     const parsedBody = createSubHeaderSchema.safeParse(req.body);
//     if (!parsedBody.success) {
//       return res.status(400).json({
//         message: "Invalid Inputs",
//         error: parsedBody.error.format(),
//       });
//     }

//     const { title, headerId, order } = parsedBody.data;

//     try {
//       const header = await Header.findById(headerId);
//       if (!header) {
//         return res.status(404).json({ message: "Header not found!" });
//       }

//       const subheader = await Subheader.create({
//         title,
//         order,
//         headersRef: header._id,
//       });
//       header.subheaders.push(subheader._id);
//       await header.save();

//       return res.status(201).json({
//         message: "Subheader successfully created",
//         subheader,
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

// pageRouter.post(
//   "/create-button",
//   authMiddleware,
//   async (req: Request, res: Response): Promise<any> => {
//     const parsedBody = createButtonSchema.safeParse(req.body);
//     if (!parsedBody.success) {
//       return res.status(400).json({
//         message: "Invalid Inputs",
//         error: parsedBody.error.format(),
//       });
//     }

//     const {
//       displayText,
//       headerId,
//       subheaderId,
//       onLeftClickOutput,
//       onRightClickOutput,
//       leftClickSubOptions,
//       rightClickSubOptions,
//     } = parsedBody.data;

//     try {
//       let parent;
//       if (headerId) {
//         parent = await Header.findById(headerId);
//       } else if (subheaderId) {
//         parent = await Subheader.findById(subheaderId);
//       }

//       if (!parent) {
//         return res.status(404).json({
//           message: "Parent Header or Subheader not found!",
//         });
//       }

//       const button = await Button.create({
//         displayText,
//         headerRef: headerId || undefined,
//         subheaderRef: subheaderId || undefined,
//         onLeftClickOutput,
//         onRightClickOutput,
//         rightClickSubOptions: rightClickSubOptions || [],
//         leftClickSubOptions: leftClickSubOptions || [],
//       });

//       if (headerId) {
//         parent.buttons.push(button._id);
//       } else if (subheaderId) {
//         parent.buttons.push(button._id);
//       }

//       await parent.save();

//       return res.status(201).json({
//         message: "Button successfully created",
//         button,
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

pageRouter.get(
  "/all",
  authMiddleware,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const pages = await Page.find({});
      // .populate({
      //   path: "headers",
      //   populate: {
      //     path: "subheaders",
      //     populate: {
      //       path: "buttons",
      //     },
      //   },
      // })
      // .populate({
      //   path: "headers",
      //   populate: {
      //     path: "buttons",
      //   },
      // });

      return res.status(200).json({
        pages,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

pageRouter.get(
  "/page-details/:pageId",
  async (req: Request, res: Response): Promise<any> => {
    const { pageId } = req.params;

    if (!pageId) {
      return res.status(400).json({
        message: "Page Id is missing",
      });
    }

    try {
      const page = await Page.findById(pageId).populate({
        path: "headers",
        populate: [
          {
            path: "buttons",
            populate: [
              { path: "leftClickSubOptions" },
              { path: "rightClickSubOptions" },
            ],
          },
          {
            path: "subheaders",
            populate: {
              path: "buttons",
              populate: [
                { path: "leftClickSubOptions" },
                { path: "rightClickSubOptions" },
              ],
            },
          },
        ],
      });

      if (!page) {
        return res.status(404).json({ message: "Page not found!" });
      }

      return res.status(200).json({ page });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);
