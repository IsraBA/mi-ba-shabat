"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { GeneralTab } from "@/components/settings/GeneralTab";
import { BirthdaysTab } from "@/components/settings/BirthdaysTab";
import { FaGear, FaCakeCandles } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa";

// Settings page with tabs for general preferences and family birthday data
export default function SettingsPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto w-full p-3 sm:p-4">
      {/* Back-to-calendar button matching the event page */}
      <div className="pt-2 -mx-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/calendar")}
          className="gap-1"
        >
          <FaArrowRight className="w-3 h-3" />
          חזרה ללוח
        </Button>
      </div>

      <h1 className="text-2xl font-bold mb-3 text-center">הגדרות</h1>

      <Tabs defaultValue="general" dir="rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="general" className="gap-1 text-sm">
            <FaGear className="w-4 h-4" />
            כללי
          </TabsTrigger>
          <TabsTrigger value="birthdays" className="gap-1 text-sm">
            <FaCakeCandles className="w-4 h-4" />
            ימי הולדת
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="birthdays">
          <BirthdaysTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
