import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToastButtons } from './toast-buttons';

const variants = ['default', 'outline', 'secondary', 'ghost', 'destructive', 'link'] as const;
const sizes = ['xs', 'sm', 'default', 'lg'] as const;
const iconSizes = ['icon-xs', 'icon-sm', 'icon', 'icon-lg'] as const;
const badgeVariants = ['default', 'secondary', 'destructive', 'warning', 'success', 'outline', 'ghost', 'link'] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

// Dev-only visual review surface; a 404 in production keeps it off the public site.
export default function UiGallery() {
  if (process.env.NODE_ENV === 'production') notFound();

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-10 p-6">
      <h1 className="text-2xl font-semibold">UI primitives (dev only)</h1>

      <Section title="Button">
        {variants.map((variant) => (
          <div key={variant} className="flex flex-wrap items-center gap-2">
            <span className="w-24 text-xs text-muted-foreground">{variant}</span>
            {sizes.map((size) => (
              <Button key={size} variant={variant} size={size}>{size}</Button>
            ))}
            {iconSizes.map((size) => (
              <Button key={size} variant={variant} size={size} aria-label={size}>+</Button>
            ))}
            <Button variant={variant} disabled>disabled</Button>
            <Button variant={variant} aria-invalid>invalid</Button>
          </div>
        ))}
      </Section>

      <Section title="Badge">
        <div className="flex flex-wrap gap-2">
          {badgeVariants.map((variant) => (
            <Badge key={variant} variant={variant}>{variant}</Badge>
          ))}
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          {(['default', 'sm'] as const).map((size) => (
            <Card key={size} size={size}>
              <CardHeader>
                <CardTitle>Card {size}</CardTitle>
                <CardDescription>Description text</CardDescription>
                <CardAction><Badge variant="success">action</Badge></CardAction>
              </CardHeader>
              <CardContent>Content</CardContent>
              <CardFooter><Button size="sm">Footer</Button></CardFooter>
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Input / Label / Separator">
        <div className="grid max-w-sm gap-2">
          <Label htmlFor="ui-plain">Label</Label>
          <Input id="ui-plain" placeholder="Placeholder" />
          <Input defaultValue="disabled" disabled />
          <Input defaultValue="aria-invalid" aria-invalid />
          <Separator />
          <div className="flex h-6 items-center gap-2">a<Separator orientation="vertical" />b</div>
        </div>
      </Section>

      <Section title="Field / FieldError">
        <div className="grid max-w-sm gap-4">
          <Field>
            <FieldLabel>Valid</FieldLabel>
            <FieldControl><Input defaultValue="ok" /></FieldControl>
            <FieldDescription>Helper text</FieldDescription>
            <FieldError>Hidden while valid</FieldError>
          </Field>
          <Field invalid>
            <FieldLabel>Invalid</FieldLabel>
            <FieldControl><Input defaultValue="bad" /></FieldControl>
            <FieldDescription>Helper text</FieldDescription>
            <FieldError>This field is required</FieldError>
          </Field>
        </div>
      </Section>

      <Section title="Spinner">
        <div className="flex items-center gap-4">
          <Spinner />
          <Spinner className="text-2xl text-primary" />
          <Button disabled><Spinner />Saving</Button>
        </div>
      </Section>

      <Section title="Tabs">
        {(['default', 'line'] as const).map((variant) => (
          <Tabs key={variant} defaultValue="a">
            <TabsList variant={variant}>
              <TabsTrigger value="a">All</TabsTrigger>
              <TabsTrigger value="b">Mine</TabsTrigger>
              <TabsTrigger value="c" disabled>Off</TabsTrigger>
            </TabsList>
            <TabsContent value="a">{variant}: all</TabsContent>
            <TabsContent value="b">{variant}: mine</TabsContent>
          </Tabs>
        ))}
      </Section>

      <Section title="Sheet">
        <div className="flex flex-wrap gap-2">
          {(['left', 'right', 'top', 'bottom'] as const).map((side) => (
            <Sheet key={side}>
              <SheetTrigger asChild><Button variant="outline">{side}</Button></SheetTrigger>
              <SheetContent side={side}>
                <SheetHeader>
                  <SheetTitle>Sheet {side}</SheetTitle>
                  <SheetDescription>Overlay, close button, focus trap.</SheetDescription>
                </SheetHeader>
                <SheetFooter><Button>Action</Button></SheetFooter>
              </SheetContent>
            </Sheet>
          ))}
        </div>
      </Section>

      <Section title="Toaster (bottom-right, rich colors, 4s)">
        <ToastButtons />
      </Section>
    </main>
  );
}
