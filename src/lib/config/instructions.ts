import type { Config } from "@/types/instructions";

const config: Config = {
  sources: [
    {
      id: 'strava-desktop',
      title: "Strava Desktop",
      downloadSteps: [
        {
          text: "Log in to your Strava account from a browser on your computer. From the dashboard, navigate to the nav bar at the top of the screen, hover over the 'Training' tab, and select 'My Activities' from the dropdown menu."
        },
        {
          text: "Click on the title of the desired activity."
        },
        {
          text: "Find and click the three horizontal dots icon to open options for the activity and select 'Export GPX' from the popover that appears. Your browser should prompt you to choose a location for your gpx file download. Please ensure the file extension is '.gpx'."
        }
      ]
    }
  ]
}

export default config;