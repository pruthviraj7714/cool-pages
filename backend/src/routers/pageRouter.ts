import { Request, Response, Router } from "express";
import authMiddleware from "../middleware";
import { z } from "zod";
import { Button, Header, Page, SubHeader } from "../models/page";

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

  if (
    buttonData.leftClickSubOptions &&
    buttonData.leftClickSubOptions.length > 0
  ) {
    const leftClickPromises = buttonData.leftClickSubOptions.map(
      (subButton: any) =>
        createButton(subButton, createdButton._id, "subheader")
    );
    const createdLeftClickSubOptions = await Promise.all(leftClickPromises);

    createdButton.leftClickSubOptions = createdLeftClickSubOptions.map(
      (b) => b._id
    );
  }

  if (
    buttonData.rightClickSubOptions &&
    buttonData.rightClickSubOptions.length > 0
  ) {
    const rightClickPromises = buttonData.rightClickSubOptions.map(
      (subButton: any) =>
        createButton(subButton, createdButton._id, "subheader")
    );
    const createdRightClickSubOptions = await Promise.all(rightClickPromises);

    createdButton.rightClickSubOptions = createdRightClickSubOptions.map(
      (b) => b._id
    );
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
                const createdSubheader = await SubHeader.create({
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

// pageRouter.get(
//   "/page-details/:pageId",
//   async (req: Request, res: Response): Promise<any> => {
//     const { pageId } = req.params;

//     if (!pageId) {
//       return res.status(400).json({
//         message: "Page Id is missing",
//       });
//     }

//     try {
//       const page = await Page.findById(pageId).populate({
//         path: "headers",
//         populate: [
//           {
//             path: "buttons",
//             populate: [
//               { path: "leftClickSubOptions" },
//               { path: "rightClickSubOptions" },
//             ],
//           },
//           {
//             path: "subheaders",
//             populate: {
//               path: "buttons",
//               populate: [
//                 { path: "leftClickSubOptions" },
//                 { path: "rightClickSubOptions" },
//               ],
//             },
//           },
//         ],
//       });

//       if (!page) {
//         return res.status(404).json({ message: "Page not found!" });
//       }

//       return res.status(200).json({ page });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

pageRouter.get(
  "/page-details/:pageId",
  async (req: Request, res: Response): Promise<any> => {
    async function populateButtonRecursively(button: any) {
      if (!button) return null;

      const populatedButton = await Button.findById(button._id)
        .populate("headerId")
        .populate("subheaderId")
        .populate({
          path: "leftClickSubOptions",
          populate: [
            { path: "headerId"},
            { path: "subheaderId" },
          ],
        })
        .populate({
          path: "rightClickSubOptions",
          populate: [
            { path: "headerId" },
            { path: "subheaderId" },
          ],
        });

      if (populatedButton?.leftClickSubOptions) {
        //@ts-ignore
        populatedButton?.leftClickSubOptions = await Promise.all(
          populatedButton.leftClickSubOptions.map(populateButtonRecursively)
        );
      }

      if (populatedButton?.rightClickSubOptions) {
        //@ts-ignore
        populatedButton?.rightClickSubOptions = await Promise.all(
          populatedButton.rightClickSubOptions.map(populateButtonRecursively)
        );
      }

      return populatedButton;
    }

    try {
      const page = await Page.findById(req.params.pageId).populate({
        path: "headers",
        populate: [
          {
            path: "subheaders",
            populate: {
              path: "buttons",
              populate: ["leftClickSubOptions", "rightClickSubOptions"],
            },
          },
          {
            path: "buttons",
            populate: ["leftClickSubOptions", "rightClickSubOptions"],
          },
        ],
      });

      res.json({ page });
    } catch (error: any) {
      res.status(500).json({
        message: "Error fetching page details",
        error: error.message,
      });
    }
  }
);

pageRouter.post("/populate-dummy-data", async (req, res) => {
  try {
    await Promise.all([
      Page.deleteMany({}),
      Header.deleteMany({}),
      SubHeader.deleteMany({}),
      Button.deleteMany({}),
    ]);

    const headers = await Header.create([
      { title: "Header 1", displayText: "Header-1 text", order: 1 },
      { title: "Header 2", displayText: "Header-2 text", order: 2 },
      { title: "Header 3", displayText: "Header-3 text", order: 3 },
      { title: "Header 4", displayText: "Header-4 text", order: 4 },
      { title: "Header 5", displayText: "Header-5 text", order: 5 },
    ]);

    const subheaders = await SubHeader.create([
      { title: "SubHeader 1.1", order: 1 },
      { title: "SubHeader 1.2", order: 2 },
      { title: "SubHeader 2.1", order: 1 },
      { title: "SubHeader 2.2", order: 2 }, 
      { title: "SubHeader 3.1", order: 1 },
      { title: "SubHeader 4.1", order: 1 },
    ]);

    const headerButtons = await Button.create([
      { displayText: "Header 1 Button", onLeftClickOutput: "Header 1 Left Click", onRightClickOutput: "Header 1 Right Click", headerId: headers[0]._id },
      { displayText: "Header 2 Button", onLeftClickOutput: "Header 2 Left Click", onRightClickOutput: "Header 2 Right Click", headerId: headers[1]._id },
      { displayText: "Header 3 Button", onLeftClickOutput: "Header 3 Left Click", onRightClickOutput: "Header 3 Right Click", headerId: headers[2]._id },
      { displayText: "Header 4 Button", onLeftClickOutput: "Header 4 Left Click", onRightClickOutput: "Header 4 Right Click", headerId: headers[3]._id },
      { displayText: "Header 5 Button", onLeftClickOutput: "Header 5 Left Click", onRightClickOutput: "Header 5 Right Click", headerId: headers[4]._id },
    ]);

    const subheaderButtons = await Button.create([
      { displayText: "SubHeader 1.1 Button", onLeftClickOutput: "Subheader 1.1 Left Click", onRightClickOutput: "SubHeader 1.1 Right Click", subheaderId: subheaders[0]._id },
      { displayText: "SubHeader 1.2 Button", onLeftClickOutput: "Subheader 1.2 Left Click", onRightClickOutput: "SubHeader 1.2 Right Click", subheaderId: subheaders[1]._id },
      { displayText: "SubHeader 2.1 Button", onLeftClickOutput: "Subheader 2.1 Left Click", onRightClickOutput: "SubHeader 2.1 Right Click", subheaderId: subheaders[2]._id },
      { displayText: "SubHeader 2.2 Button 1", onLeftClickOutput: "Subheader 2.2 Button 1 Left Click", onRightClickOutput: "SubHeader 2.2 Button 1 Right Click", subheaderId: subheaders[3]._id },
      { displayText: "SubHeader 2.2 Button 2", onLeftClickOutput: "Subheader 2.2 Button 2 Left Click", onRightClickOutput: "SubHeader 2.2 Button 2 Right Click", subheaderId: subheaders[3]._id },
      { displayText: "SubHeader 3.1 Button", onLeftClickOutput: "Subheader 3.1 Left Click", onRightClickOutput: "SubHeader 3.1 Right Click", subheaderId: subheaders[4]._id },
      { displayText: "SubHeader 4.1 Button", onLeftClickOutput: "Subheader 4.1 Left Click", onRightClickOutput: "SubHeader 4.1 Right Click", subheaderId: subheaders[5]._id },
    ]);

    const advancedButtons = await Button.create([
      { displayText: "Advanced Button 1", leftClickSubOptions: [subheaderButtons[0]._id], rightClickSubOptions: [subheaderButtons[1]._id], subheaderId: subheaders[2]._id },
      { displayText: "Advanced Button 2", leftClickSubOptions: [subheaderButtons[2]._id], rightClickSubOptions: [subheaderButtons[3]._id], subheaderId: subheaders[3]._id },
    ]);

    headers[0].subheaders = [subheaders[0]._id, subheaders[1]._id];
    headers[0].buttons = [headerButtons[0]._id];
    headers[1].subheaders = [subheaders[2]._id, subheaders[3]._id];
    headers[1].buttons = [headerButtons[1]._id];
    headers[2].subheaders = [subheaders[4]._id];
    headers[2].buttons = [headerButtons[2]._id];
    headers[3].subheaders = [subheaders[5]._id];
    headers[3].buttons = [headerButtons[3]._id];
    headers[4].buttons = [headerButtons[4]._id];
    await Promise.all(headers.map((header) => header.save()));

    subheaders[0].buttons = [subheaderButtons[0]._id];
    subheaders[1].buttons = [subheaderButtons[1]._id];
    subheaders[2].buttons = [subheaderButtons[2]._id, advancedButtons[0]._id];
    subheaders[3].buttons = [subheaderButtons[3]._id, subheaderButtons[4]._id, advancedButtons[1]._id]; // Added SubHeader 2.2 buttons
    subheaders[4].buttons = [subheaderButtons[5]._id];
    await Promise.all(subheaders.map((subheader) => subheader.save()));

    const page = await Page.create({
      title: "Main Page",
      headers: headers.map((header) => header._id),
    });

    const populatedPage = await Page.findById(page._id).populate({
      path: "headers",
      populate: [
        {
          path: "subheaders",
          populate: { path: "buttons", populate: ["leftClickSubOptions", "rightClickSubOptions"] },
        },
        { path: "buttons", populate: ["leftClickSubOptions", "rightClickSubOptions"] },
      ],
    });

    res.json({
      message: "Unique dummy data populated successfully",
      data: populatedPage,
    });
  } catch (error : any) {
    console.error("Error populating dummy data:", error);
    res.status(500).json({
      message: "Error populating dummy data",
      error: error.message,
    });
  }
});

