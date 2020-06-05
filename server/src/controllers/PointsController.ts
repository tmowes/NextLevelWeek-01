/* eslint-disable no-console */
/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Request, Response } from 'express'
import knex from '../database/connection'

export default class PointsController {
  async create(request: Request, response: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = await request.body
    const trx = await knex.transaction()
    const point = {
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    }
    const insertedIds = await trx('points').insert(point)
    const point_id = insertedIds[0]
    const pointsItems = items
      .split(',')
      .map((item: string) => Number(item.trim()))
      .map((item_id: number) => {
        return {
          item_id,
          point_id,
        }
      })
    await trx('points_items').insert(pointsItems)
    await trx.commit()
    return response.json({ id: point_id, ...point })
  }

  async index(request: Request, response: Response) {
    const { city, uf, items } = request.query
    const parsedItems = String(items)
      .split(',')
      .map(item => Number(item.trim()))
    const points = await knex('points')
      .join('points_items', 'points.id', '=', 'points_items.point_id')
      .whereIn('points_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()
      .select('points.*')
    const serializedPoints = points.map(point => {
      return {
        ...point,
        image_url: `http://192.168.2.103:3333/uploads/${point.image}`,
      }
    })
    return response.json(serializedPoints)
  }

  async show(request: Request, response: Response) {
    const { id } = request.params
    const point = await knex('points').where('id', id).first()
    if (!point) {
      return response.status(400).json({ message: 'Point not found.' })
    }
    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id)
      .select('items.title')
    const serializedPoint = {
      ...point,
      image_url: `http://192.168.2.103:3333/uploads/${point.image}`,
    }

    return response.json({ point: serializedPoint, items })
  }
}
