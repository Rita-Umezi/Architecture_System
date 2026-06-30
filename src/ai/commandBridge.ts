// ─── AI → Command Bridge ───────────────────────────────────────────────────
// Converts AI-generated IFloorPlanAIData into BatchCommand for CommandBus.

import type { IFloorPlanAIData } from '../../types/ai.types'
import { AddWallCommand, BatchCommand } from '../core/history/commands/index'
import type { ICommand } from '../core/history/CommandBus'

export function floorPlanDataToCommands(data: IFloorPlanAIData, layerId = 'layer-walls'): BatchCommand {
  const commands: ICommand[] = []

  for (const wall of data.walls) {
    commands.push(new AddWallCommand(
      { x: wall.startX, y: wall.startY },
      { x: wall.endX,   y: wall.endY   },
      layerId,
      { thickness: wall.thickness ?? 200 }
    ))
  }

  return new BatchCommand(commands, `AI Floor Plan — ${data.buildingType} (${data.totalArea} m²)`)
}
