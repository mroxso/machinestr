import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { RelayListManager } from "@/components/RelayListManager";
import { useTheme } from "@/hooks/useTheme";
import { useNavigate } from "react-router-dom";
import { Moon, Sun, Monitor, ArrowLeft } from "lucide-react";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your application preferences and relay connections
        </p>
      </div>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the application looks on your device
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Label className="text-base">Theme</Label>
            <RadioGroup
              value={theme}
              onValueChange={(value) => setTheme(value as "light" | "dark" | "system")}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem
                  value="light"
                  id="light"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="light"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Light</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="dark"
                  id="dark"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="dark"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">Dark</span>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="system"
                  id="system"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-colors"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  <span className="text-sm font-medium">System</span>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-sm text-muted-foreground">
              Select the theme for the application. System theme will follow your device preferences.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Relay Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Nostr Relays</CardTitle>
          <CardDescription>
            Configure which relays to use for reading and publishing events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RelayListManager />
        </CardContent>
      </Card>
    </div>
  );
}
