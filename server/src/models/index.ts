// ─── Mongoose Models ───────────────────────────────────────────────────────

import mongoose, { Schema, Document } from 'mongoose'

// ─── User Model ────────────────────────────────────────────────────────────

export interface IUserDoc extends Document {
  name: string
  email: string
  passwordHash: string
  avatar?: string
  createdAt: Date
}

const UserSchema = new Schema<IUserDoc>({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  avatar:       { type: String },
}, { timestamps: true })

export const UserModel = mongoose.model<IUserDoc>('User', UserSchema)

// ─── Project Model ─────────────────────────────────────────────────────────

export interface IProjectDoc extends Document {
  name: string
  description?: string
  ownerId: string
  collaboratorIds: string[]
  floors: Array<{ id: string; name: string; level: number; floorHeight: number; sceneGraphId: string }>
  activeFloorId: string
  schemaVersion: number
  tags: string[]
  thumbnail?: string
  metadata: Record<string, unknown>
  createdAt: Date
  updatedAt: Date
}

const FloorSchema = new Schema({
  id:           { type: String, required: true },
  name:         { type: String, required: true },
  level:        { type: Number, required: true },
  floorHeight:  { type: Number, default: 3000 },
  sceneGraphId: { type: String, required: true },
}, { _id: false })

const ProjectSchema = new Schema<IProjectDoc>({
  name:            { type: String, required: true },
  description:     { type: String },
  ownerId:         { type: String, required: true },
  collaboratorIds: { type: [String], default: [] },
  floors:          { type: [FloorSchema], default: [] },
  activeFloorId:   { type: String, required: true },
  schemaVersion:   { type: Number, default: 1 },
  tags:            { type: [String], default: [] },
  thumbnail:       { type: String },
  metadata:        { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true })

export const ProjectModel = mongoose.model<IProjectDoc>('Project', ProjectSchema)

// ─── SceneData Model ───────────────────────────────────────────────────────

export interface ISceneDataDoc extends Document {
  projectId: string
  floorId: string
  elements: unknown[]
  version: number
  updatedAt: Date
}

const SceneDataSchema = new Schema<ISceneDataDoc>({
  projectId: { type: String, required: true },
  floorId:   { type: String, required: true },
  elements:  { type: Schema.Types.Mixed, default: [] },
  version:   { type: Number, default: 1 },
}, { timestamps: true })

SceneDataSchema.index({ projectId: 1, floorId: 1 }, { unique: true })

export const SceneDataModel = mongoose.model<ISceneDataDoc>('SceneData', SceneDataSchema)
