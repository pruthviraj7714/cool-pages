import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { BACKEND_URL } from "@/config/config";

const buttonSchema : any = z.object({
  displayText: z
    .string()
    .min(3, { message: "Display text must be at least 3 characters long." }),
  headerId: z.string().optional(),
  subheaderId: z.string().optional(),
  onLeftClickOutput: z.string().optional(),
  onRightClickOutput: z.string().optional(),
  leftClickSubOptions: z.array(z.lazy(() => buttonSchema)).optional(),
  rightClickSubOptions: z.array(z.lazy(() => buttonSchema)).optional(),
});

const subHeaderSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." }),
  order: z.number().int().positive(),
  buttons: z.array(buttonSchema).optional(),
});

const headerSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." }),
  order: z.number().int().positive(),
  subheaders: z.array(subHeaderSchema).optional(),
  buttons: z.array(buttonSchema).optional(),
});

const createPageSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be at least 3 characters long." }),
  headers: z.array(headerSchema).optional(),
});

type CreatePageFormValues = z.infer<typeof createPageSchema>;

export default function CreatePage() {
  const form = useForm<CreatePageFormValues>({
    resolver: zodResolver(createPageSchema),
    defaultValues: {
      title: "",
      headers: [],
    },
  });

  const {
    fields: headerFields,
    append: appendHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: form.control,
    name: "headers",
  });

  const onSubmit = async (data: CreatePageFormValues) => {
    try {
      await axios.post(`${BACKEND_URL}/pages/create-page`, {
        data
      })

      toast.success("Page Successfully Created!");
    } catch (error : any) {
      toast.error('Error while create page', {
        description : error.response.data.message
      })
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Page</CardTitle>
          <CardDescription>
            Fill in the details to create a new page structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Page Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter page title" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is the main title of your page.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Headers</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendHeader({
                        title: "",
                        order: headerFields.length + 1,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Header
                  </Button>
                </div>
                {headerFields.map((field, index) => (
                  <HeaderForm
                    key={field.id}
                    form={form}
                    index={index}
                    onRemove={() => removeHeader(index)}
                  />
                ))}
              </div>

              <Button type="submit">Create Page</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

function HeaderForm({
  form,
  index,
  onRemove,
}: {
  form: any;
  index: number;
  onRemove: () => void;
}) {
  const {
    fields: subHeaderFields,
    append: appendSubHeader,
    remove: removeSubHeader,
  } = useFieldArray({
    control: form.control,
    name: `headers.${index}.subheaders`,
  });

  const {
    fields: buttonFields,
    append: appendButton,
    remove: removeButton,
  } = useFieldArray({
    control: form.control,
    name: `headers.${index}.buttons`,
  });

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-xl">Header {index + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`headers.${index}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Header Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter header title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`headers.${index}.order`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="subheaders">
              <AccordionTrigger>Subheaders</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {subHeaderFields.map((subField, subIndex) => (
                    <SubHeaderForm
                      key={subField.id}
                      form={form}
                      headerIndex={index}
                      subHeaderIndex={subIndex}
                      onRemove={() => removeSubHeader(subIndex)}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendSubHeader({
                        title: "",
                        order: subHeaderFields.length + 1,
                      })
                    }
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Subheader
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="buttons">
              <AccordionTrigger>Buttons</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {buttonFields.map((buttonField, buttonIndex) => (
                    <ButtonForm
                      key={buttonField.id}
                      form={form}
                      headerIndex={index}
                      buttonIndex={buttonIndex}
                      onRemove={() => removeButton(buttonIndex)}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendButton({ displayText: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Button
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={onRemove}>
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Header
        </Button>
      </CardFooter>
    </Card>
  );
}

function SubHeaderForm({
  form,
  headerIndex,
  subHeaderIndex,
  onRemove,
}: {
  form: any;
  headerIndex: number;
  subHeaderIndex: number;
  onRemove: () => void;
}) {
  const {
    fields: buttonFields,
    append: appendButton,
    remove: removeButton,
  } = useFieldArray({
    control: form.control,
    name: `headers.${headerIndex}.subheaders.${subHeaderIndex}.buttons`,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Subheader {subHeaderIndex + 1}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`headers.${headerIndex}.subheaders.${subHeaderIndex}.title`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subheader Title</FormLabel>
                <FormControl>
                  <Input placeholder="Enter subheader title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`headers.${headerIndex}.subheaders.${subHeaderIndex}.order`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="buttons">
              <AccordionTrigger>Buttons</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {buttonFields.map((buttonField, buttonIndex) => (
                    <ButtonForm
                      key={buttonField.id}
                      form={form}
                      headerIndex={headerIndex}
                      subHeaderIndex={subHeaderIndex}
                      buttonIndex={buttonIndex}
                      onRemove={() => removeButton(buttonIndex)}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendButton({ displayText: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Button
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={onRemove}>
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Subheader
        </Button>
      </CardFooter>
    </Card>
  );
}

function ButtonForm({
  form,
  headerIndex,
  subHeaderIndex,
  buttonIndex,
  onRemove,
}: {
  form: any;
  headerIndex: number;
  subHeaderIndex?: number;
  buttonIndex: number;
  onRemove: () => void;
}) {
  const buttonPath =
    subHeaderIndex !== undefined
      ? `headers.${headerIndex}.subheaders.${subHeaderIndex}.buttons.${buttonIndex}`
      : `headers.${headerIndex}.buttons.${buttonIndex}`;

  const {
    fields: leftSubOptionFields,
    append: appendLeftSubOption,
    remove: removeLeftSubOption,
  } = useFieldArray({
    control: form.control,
    name: `${buttonPath}.leftClickSubOptions`,
  });

  const {
    fields: rightSubOptionFields,
    append: appendRightSubOption,
    remove: removeRightSubOption,
  } = useFieldArray({
    control: form.control,
    name: `${buttonPath}.rightClickSubOptions`,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Button {buttonIndex + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name={`${buttonPath}.displayText`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Text</FormLabel>
                <FormControl>
                  <Input placeholder="Enter button text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${buttonPath}.onLeftClickOutput`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Left Click Output</FormLabel>
                <FormControl>
                  <Input placeholder="Enter left click output" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`${buttonPath}.onRightClickOutput`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Right Click Output</FormLabel>
                <FormControl>
                  <Input placeholder="Enter right click output" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="leftSubOptions">
              <AccordionTrigger>Left Click Sub-options</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {leftSubOptionFields.map((subOptionField, subOptionIndex) => (
                    <ButtonForm
                      key={subOptionField.id}
                      form={form}
                      headerIndex={headerIndex}
                      subHeaderIndex={subHeaderIndex}
                      buttonIndex={subOptionIndex}
                      onRemove={() => removeLeftSubOption(subOptionIndex)}
                    />
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendLeftSubOption({ displayText: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Left Sub-option
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rightSubOptions">
              <AccordionTrigger>Right Click Sub-options</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {rightSubOptionFields.map(
                    (subOptionField, subOptionIndex) => (
                      <ButtonForm
                        key={subOptionField.id}
                        form={form}
                        headerIndex={headerIndex}
                        subHeaderIndex={subHeaderIndex}
                        // Index={subHeaderIndex}
                        buttonIndex={subOptionIndex}
                        onRemove={() => removeRightSubOption(subOptionIndex)}
                      />
                    )
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendRightSubOption({ displayText: "" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Right Sub-option
                  </Button>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="destructive" onClick={onRemove}>
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Button
        </Button>
      </CardFooter>
    </Card>
  );
}
