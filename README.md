# tska
tska is a ChatTriggers library used by other modules to enhance development, it provides various useful features so the developer does not have to worry about implementing them.

# Usage
Currently there's only Rendering helper functions, though i expect to add more to this later on.

from the example:
```js
import { Render2D } from "../tska/rendering/Render2D"
import { Render3D } from "../tska/rendering/Render3D"

// Rendering 3D (on world)
register("renderWorld", () => {
    Render3D.outlineBlock(
        World.getBlockAt(-17, 70, -4),
        0, 255, 255, 255, true
    )
    Render3D.filledBlock(
        World.getBlockAt(-17, 70, -4),
        0, 255, 255, 50, true
    )
    Render3D.renderWaypoint("&aTest", -17, 70, -4, 0, 255, 255, 255)
    Render3D.renderString("&bThis\n&cMaybe\n&aWorks", -17, 74, -4, [0, 0, 0, 80])
})

const placeholderItem = new Item("minecraft:skull")

// Rendering 2D (on screen)
register("renderOverlay", () => {
    // Drawing rect with tska is a bit different than usual
    // We first have to setup the stack like this
    Render2D.preDrawRect()
    // Then we do our drawing of rects
    // It's done this way so you don't have to setup the stack per draw call
    Render2D.colorize(0, 0, 0, 150)
    Render2D.drawRect(10, 10, 50, 50)
    Render2D.colorize(255, 255, 255, 150)
    Render2D.drawRect(9, 9, 51, 51, false)
    // And at the end we can reset the stack to its original state
    Render2D.postDrawRect()

    // Drawing an item with custom z level
    // This is similar to the way that ct does it so not much of a improvement
    Render2D.drawItem(placeholderItem, 30, 30)
})

register("postGuiRender", () => {
    // Drawing a hovering text (similar to how ToolTip looks)
    // This allows for changing the color of the border and background as well as changing the z level
    // Which is important on some areas where a dev might want customization
    Render2D.drawHoveringText(["&bMy hovering", "&cText"])
})

// We can also shot a title to the player
Render2D.showTitle("&aMy &cTest", "[Something]", 5000)
```

# License
tska is licensed under the [AGPL 3.0 License](https://github.com/DocilElm/tska/blob/main/LICENSE)