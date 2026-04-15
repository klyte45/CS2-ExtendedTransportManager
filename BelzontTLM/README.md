# Xtended Transport Manager
## _A better view of public transport_

This is successor from both Transport Lines Manager (TLM) and Improved Transport Manager (ITM) from CS1. 

The overall idea is bring some tools to better manage and visualize the public transport of the city.

## No major dependency required

Since 1.0, only Universal Icons Library is required to use this mod (no support/requirement for EUIS anymore).

## For Write Everywhere users! *(new at 0.1.4)*

Now you can edit dynamic blinds for each line:
	- Add multiple keyframes and setup how many frames it shall be shown in game. Each keyframe can show a destination, the line name/number or a fixed text
	- Select one of the keyframes to be used when a static destination blind is used (may be useful in future for classic custom vehicles)
	- Add multiple steps! Each step will be used until before the selected stop (or end of the line). Each step may have one or more keyframes.

By default, XTM creates two steps each line with two keyframes: Line number and the selected stop for that step end. The steps will target the stop at middle of the line *(n ÷ 2)* and the end of the line.


## Current features

- Auto color - import palettes to the city then apply to transport type
  - 20+ default palletes included on default library bookmark.
  - Create your own palettes using the game UI with color pickers
  - You can load `.hex` files anywhere on pc with the file picker (palette folder from mod is recommended because it's where the navigation begins)
  - Palettes used in the city are saved along them.
- Detailed linear map - View detailed info about stops, vehicles and also transport integrations. Toggleable with vanilla map.
- Customize line naming - You can use the game name pattern to use the route identifier as you wish, using any kind of characters
- Lines shields - like it was in TLM:
  - Hexagon for buses
  - Trapeze for trams
  - Square for metro
  - Circle for trains
  - Diamond for ships
  - Pentagon for airplanes

Cargo routes receive a little "©" below the line icon for easy recognization

Notice that the changelog may have more details about the mod features (starting from version 1.0.0)

## Support

The most up to date information about installation and known issues and bugs are in the forums topic.