# Indeed Radius Filter v1.17

Logo: blue rounded square, white map pin in the middle, white radius ring around it, with yellow dots on the ring.

## What was wrong in v1.8, and what v1.9 fixes

When you changed pages, the map was not updated at all. It kept showing the old page jobs, or nothing new.

Cause: the map only collected jobs when you clicked Show map or Filter by circle. Nothing watched for a page change, and there was no choice between doing one page at a time or going through all pages automatically.

### 1. New option: Page by page or Automated
You can now choose Load mode, in three places, all synced:
- Extension popup, top right in Chrome: Load mode, Page by page, default, or Automated, all pages, up to 10 pages.
- Indeed floating panel, bottom right on the Indeed page: Load mode, Page by page, default, or Automated, all pages, up to 10.
- Map overlay controls, at the top of the map: Load, Page by page or Automated, all pages.

Page by page, default:
- Load all loads only the page you are on.
- When you go to the Next or Previous page, the map updates automatically to that page. It replaces the old pins with the new page jobs.
- Safe and slow, like before.

Automated, all pages, up to 10 pages:
- Load all loads this page, then goes to the next page by itself, loads it, and so on, up to 10 pages.
- The map collects all of them, without duplicates, by job key, data-jk. Pins from page 1 stay, pins from page 2 are added.
- It saves its progress, so if Indeed reloads the page when it goes to the next page, it continues on the new page by itself.
- Click Stop to stop automated mode at any time. It will not go to the next page after you stop.
- Warning: automated mode is more work for Indeed, so keep Slow speed, and stop if you see a CAPTCHA or a verify you are human page.

### 2. Map updates when the page changes
- The extension now watches the page address, every 1 second, and the job list, with a MutationObserver.
- If the page number changes, for example start=0 to start=10, or the list changes, it re-collects the jobs, re-plots the pins, and updates the map count and the panel counts.
- This works in both modes. In Page by page mode it replaces the pins. In Automated mode it adds the new pins to the old ones.
- If the map is closed, the panel counts still update, so you can see the new page loaded.

### 3. Refresh map button
- In the map controls, click Refresh map to re-collect the current page and re-plot the pins, without closing the map. Use it if the map ever looks out of date.

## Map, OpenStreetMap, Canada only
OpenStreetMap with Leaflet 1.9.4 bundled inside the extension. Map stays inside Canada, latitude 41 to 84, longitude -141 to -52. Click a pin for a small popup with the job and an Open button. It opens in a new tab by default, using the job key, data-jk, as https://ca.indeed.com/viewjob?jk=, so it opens the right job, not a company link. The map fits all pins only once on first open, it does not zoom out by itself when new pins are found, use Fit all pins if you want to see all of them.

How to use it:
- Choose Load mode first, in the popup or in the Indeed panel.
- Page by page: click Load all, then Next page. The map should update to page 2 by itself. Check the map header, it should say the new page jobs.
- Automated: choose Automated, click Load all and filter in the popup, or Load all in the Indeed panel. It will load page 1, go to page 2, load it, and so on, up to 10 pages. Click Stop if you want to stop early.
- If the map ever looks stale, click Refresh map in the map controls.

## Other features, kept
- Pause and Resume, rest time, Slow Normal Fast speeds, CAPTCHA stop, exact address plus OSRM driving distance, Indeed commute time first, all Canada cities, Next and Previous page.
- You need to stay active in the Indeed tab while Load all runs. Outside range jobs are hidden with display none, not deleted. Show all brings them back.

## Install in Chrome
1. Remove the old version first, in chrome://extensions, click Remove for Indeed Radius Filter.
2. Unzip indeed-radius-filter-v1.9.zip and keep the folder indeed-radius-filter.
3. Open Chrome and go to chrome://extensions
4. Turn on Developer mode, top right.
5. Click Load unpacked.
6. Choose the folder indeed-radius-filter (the folder with manifest.json in it, not the zip file itself).
7. Open ca.indeed.com, run a job search, choose Page by page or Automated, click Load all, then click Show map.
8. Test: click Next page, check the map updates to the new page, without you clicking Refresh map or Show map again.

## Files
- manifest.json: version 1.9.0
- leaflet/leaflet.js and leaflet/leaflet.css: Leaflet 1.9.4, bundled locally
- content.js, content.css, popup.html, popup.js, popup.css
- icons/icon16.png, icon32.png, icon48.png, icon128.png, icon256.png, icon512.png: the logo

## v1.10 fix: places are now wrong on the map
Cause in v1.9: three things together made places wrong.
1. If a job card had no location element, the code guessed a town from the whole card text. A town name in the job description is often not the job place, so the pin went to the wrong town.
2. When the page changed, the map collected jobs while the list was still half loaded, so it plotted a partial, wrong set.
3. Two collects could run at the same time, and jobLocations was changed while geocoding was still running, so places could be mixed between jobs.
Fix in v1.10:
- No guessing from the description any more. The place comes only from the location element on the card, data-testid text-location or companyLocation. If there is no location, the job goes to the small list below the map, with No place shown, not to a false pin.
- When the page changes, the map waits until the job list is stable, same count twice in a row, at least 5 jobs, up to 10 seconds, before it collects. If the list is still empty, it keeps the old pins and says so.
- Collecting now builds a new list locally, then replaces the map list in one go at the end. Two collects cannot run at the same time. Old pins stay until the new list is ready.
- Duplicate pins in Automated mode now count old jobs too, so new pins at the same place do not stack exactly on top of old ones.

## v1.11 fix: should not work when not in the list, and Reset all results button
- The extension now only works on an Indeed job list page, /jobs. It does nothing on a job detail page, /viewjob, /rc/clk, /jobs/view, company, career, or profile pages. No panel, no page watcher, no auto load, no scrolling there.
- When a job is open, it no longer scrolls down. Auto load on first job click does not trigger if a job detail is already open, or if the click opens in a new tab, and scrolling stops if the page leaves the job list.
- New button Reset all results, in the Indeed panel, in the extension popup, and in the map controls. It shows all jobs again, removes distance labels, clears the map pins, stops automated mode, clears saved auto run and job locations, and keeps your center, radius and other settings.

## v1.12: Show on map button in the job detail
- New button Show on map, in the job detail at the top, next to Apply on company site, the bookmark and share buttons, in the empty space you circled in red in your screenshot.
- Click it, and the map opens, centers on that job, zoom 12, and opens that job pin popup, with the title, location, distance, and Open button.
- It finds the open job by its job key, vjk in the web address, or the selected card. If that job is not in the loaded list yet, it collects the current page first, then shows it. If the job has no place, it says so and shows it in the small list below the map.
- It does not scroll the list, it does not start Load all, and it does not work on a standalone job detail page, /viewjob. It only works on a search list with a job open on the right.

## v1.13 fix: Show on map button did not appear
Cause in v1.12: the button looked only inside a guessed detail container, data-testid job-detail or .jobsearch-JobComponent. Indeed does not always use those selectors, so the button was never added.
Fix in v1.13: the button now finds the Apply button anywhere on the page, Apply on company site or Apply now, and inserts the Show on map button right after it, with display inline-block, visible, z-index 9999.
Fallbacks added, so you are not stuck if the detail button still does not appear:
- Indeed panel, bottom right: new button Show this job on map.
- Extension popup, top right: new button Show open job on map.
Both do the same thing: open the map, center on the open job, zoom 12, and open its pin popup.

## v1.14 fix: button in wrong place, and map not showing the company place
Your screenshots: Ingenieur concepteur junior, Forage CBF, Blainville, QC. Show on map was below Apply on company site, full width, not to the right in the empty space. And the map showed only the blue center pin in Saint-Laurent, no job pin in Blainville.
Cause 1, button place: it was inserted right after the Apply button element, which put it below Apply in that column.
Fix: it now climbs up from Apply until it finds the row that holds Apply plus the bookmark, thumbs down and share buttons, and appends the button to that row, as a small inline-flex button, width auto, flex 0 0 auto, so it sits to the right of share, in the empty space you circled.
Cause 2, company place: Show on map called showMap, which re-collected the jobs and replaced the job object, so the old job was lost, and the list card location selector missed Blainville, so the job became no place and got no pin.
Fix: after showMap, it re-finds the job by its job key in the new list, then fixes its place from the job detail pane, Blainville, QC, using town coordinates 45.6667, -73.8833, then plots it and centers on it at zoom 12. Location extraction in the list now also falls back to the first line in the card that looks like Town, QC, instead of only the location element.

## v1.15 fix: company names are wrong when open in map
Your screenshots: Lead, Analyse d'affaires, Belron Canada, Montreal, QC, in the list and in the detail, but the map popup showed Lead, Analyse d'affaires, DataAnnotationToronto, ON, 497.7 km straight from center, in Toronto.
Cause: fixJobPlaceFromDetail used the whole document as the detail scope when the detail selector failed, and it used a broad [class*='location'] selector. The first location-like element on the whole page was from a different job, DataAnnotation in Toronto, and its text was company plus location with no space, DataAnnotationToronto, ON. That overwrote the correct Montreal place.
Fix in v1.15:
- Never use document as the detail scope. Only use the job detail pane, and only if its title matches the job title. If it does not match, return no location, do not guess.
- Removed the broad [class*='location'] selector everywhere. Location comes only from data-testid text-location or .companyLocation, or from a line in the card innerText that looks like Town, QC.
- Company is now stored separately, from data-testid company-name, and shown separately in the map popup: title, then company, then location, then distance. So Belron Canada, Montreal, QC, will show as Belron Canada on its own line, Montreal, QC on the next line, not mixed together.

## v1.16 fix: wrong direction showed and the map is not even opened
Cause: Show on map returned early, before opening the map, if it could not tell which job was open, vjk missing, or if the job was not in the loaded list yet. So the user saw nothing, no map at all, and no clear error. And when the map did open, showMap reset the view to the center, Saint-Laurent, which overwrote the focus on the job, so it showed the wrong direction / wrong place.
Fix in v1.16:
- Show on map now opens the map first, always, with showMap(true), keepView. Then it looks for the job. If it cannot tell which job is open, or the job is not in the list, it shows that message in the small detail bar below the map, with the job key, instead of doing nothing.
- showMap with keepView does not reset the view to the center when the map is already open. Focus on the job, zoom 12, is the last thing that happens, so it is not overwritten.
- getCurrentJobKey now also checks selected / active cards in the list, and matches the detail title to a loaded job, not only vjk in the web address.

## v1.17 fix: the city is wrong when you click Show on map
Cause: several small bugs added up to the wrong city.
1. fixJobPlaceFromDetail only ran when the job had no place at all. A job with a wrong city was never corrected, so the wrong city stuck.
2. getLocationText returned the whole job card when the location element was missing. The card holds the job description, so townCoordsFor matched a town named in the description, not the job's city.
3. townCoordsFor returned the first town in its list order found anywhere in the text. Saint-Laurent is first in the list, so any mention of Saint-Laurent beat the real city. It also missed accented towns: Montreal did not match Montreal, Quebec did not match Quebec, and Baie-D'Urfe did not match baie-durfe.
4. getCurrentJobKey used the first h2 on the whole page for its title fallback, often the first job in the list, so Show on map could centre on a different job and city.
5. getDetailLocation scanned the whole job detail pane for the first Town, QC line. That line can be in the job description (head office, other locations), not this job's city. getDetailAddress also fell back to main / the whole page, so the first postal code on the page could belong to another job.
Fix in v1.17:
- Show on map now identifies the open job first, before re-collecting the list, then corrects its city from the job detail pane every time, not only when it has no place. The correction also tries a postal code and a town lookup for towns not in the built-in list.
- Location now comes only from the location element, or from a Town, QC line in the top 8 lines of the card / top 10 lines of the detail pane. Never from the whole card or the whole description.
- townCoordsFor now matches the exact town before the comma first, then the longest whole-word town name. Accents, apostrophes and dots are stripped when matching, so Montreal, Quebec, Trois-Rivieres, Baie-D'Urfe, St. John's and Sault Ste. Marie all match. Quebec on its own now means Quebec City.
- getCurrentJobKey and the detail title check are scoped to the job detail pane only, never to the first h2 on the page.
- Version strings are synced: content.js, the panel and manifest.json all say 1.17.0 now (they said 1.11.0 in the code while the manifest said 1.16.0).
- Checked: node --check passes for content.js and popup.js, and a town test passes for Montreal, Montreal, Blainville, Saint-Laurent, Toronto, Laval, Sainte-Anne-de-Bellevue, Trois-Rivieres, Baie-D'Urfe, Dollard-des-Ormeaux, Quebec, Kirkland, St. John's and Sault Ste. Marie.
Install: remove the old version in Chrome first, unzip indeed-radius-filter-v1.17.zip, Load unpacked, pick indeed-radius-filter, reload Indeed with F5. Test: click a job, click Show on map, and check the popup city matches the city on the Indeed card and in the job detail. If one city is still wrong, tell me that job title, the city Indeed shows, and the city the map shows.
