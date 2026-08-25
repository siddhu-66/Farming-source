"use client";

import { motion } from "framer-motion";
import { WelcomeBanner } from "./WelcomeBanner";
import { HeroStatistics } from "./HeroStatistics";
import { AiInsightCard } from "./AiInsightCard";
import { QuickActionPanel } from "./QuickActionPanel";
import { WeatherWidget } from "@/components/shared/WeatherWidget";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { AnalyticsWidget } from "../widgets/AnalyticsWidget";
import { RecentActivityWidget } from "../widgets/RecentActivityWidget";
import { UpcomingTasksWidget } from "../widgets/UpcomingTasksWidget";
import { UniversalOrdersWidget } from "../widgets/UniversalOrdersWidget";
import { GovernmentSchemeWidget } from "../widgets/GovernmentSchemeWidget";
import { MarketplaceSummaryWidget } from "../widgets/MarketplaceSummaryWidget";
import { VoiceAssistantWidget } from "../widgets/VoiceAssistantWidget";
import { FarmProfileWidget } from "../widgets/FarmProfileWidget";
import { LandSummaryWidget } from "../widgets/LandSummaryWidget";
import { CurrentSeasonWidget } from "../widgets/CurrentSeasonWidget";
import { MarketOverviewWidget } from "../widgets/MarketOverviewWidget";
import { useWidgetStore } from "@/stores/widgetStore";

export function UniversalDashboardHome() {
  const { profile } = useDashboardStore();
  const { widgets } = useWidgetStore();
  
  const role = profile?.role?.toLowerCase() || 'farmer';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const isVisible = (id: string) => widgets.find(w => w.id === id)?.visible;

  return (
    <motion.div 
      className="space-y-6 pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Top Banner */}
      <motion.div variants={itemVariants}>
        <WelcomeBanner />
      </motion.div>

      {/* Hero Stats (Full width) */}
      <motion.div variants={itemVariants}>
        <HeroStatistics />
      </motion.div>

      {/* 12-Column Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
        
        {/* ROW 1: Farmer Specific Profile & Summary */}
        {isVisible('farm_profile') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-12 lg:col-span-4 min-h-[300px]">
            <FarmProfileWidget />
          </motion.div>
        )}
        {isVisible('land_summary') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 lg:col-span-4 min-h-[300px]">
            <LandSummaryWidget />
          </motion.div>
        )}
        {isVisible('current_season') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 lg:col-span-4 min-h-[300px]">
            <CurrentSeasonWidget />
          </motion.div>
        )}

        {/* ROW 2: Analytics & AI */}
        {isVisible('analytics') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-12 lg:col-span-8 min-h-[400px]">
            <AnalyticsWidget />
          </motion.div>
        )}
        
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 lg:col-span-4 min-h-[400px]">
          <AiInsightCard />
        </motion.div>

        {/* ROW 3: Activity & Quick Actions */}
        {isVisible('activity') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 lg:col-span-4 min-h-[350px]">
            <RecentActivityWidget />
          </motion.div>
        )}
        
        {isVisible('tasks') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-6 lg:col-span-4 min-h-[350px]">
            <UpcomingTasksWidget />
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="col-span-1 md:col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1">
            <QuickActionPanel />
          </div>
          {isVisible('weather') && (
            <div className="flex-1 min-h-[160px]">
              <WeatherWidget lat={28.6139} lon={77.2090} />
            </div>
          )}
        </motion.div>

        {/* ROW 4: Orders */}
        {isVisible('orders') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-12 lg:col-span-12">
            <UniversalOrdersWidget />
          </motion.div>
        )}

        {/* ROW 5: Market & Extra */}
        {isVisible('market_overview') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-4 min-h-[250px]">
            <MarketOverviewWidget />
          </motion.div>
        )}

        {/* ROW 4 */}
        {isVisible('marketplace') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-4 min-h-[250px]">
            <MarketplaceSummaryWidget />
          </motion.div>
        )}
        
        {isVisible('government') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-4 min-h-[250px]">
            <GovernmentSchemeWidget />
          </motion.div>
        )}
        
        {isVisible('voice') && (
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-4 lg:col-span-4 min-h-[250px]">
            <VoiceAssistantWidget />
          </motion.div>
        )}

      </div>
    </motion.div>
  );
}
