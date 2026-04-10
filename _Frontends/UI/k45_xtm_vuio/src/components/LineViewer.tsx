import { VanillaComponentResolver } from "@klyte45/vuio-commons";
import { Entity, Name } from "cs2/bindings"
import { useState } from "react";

type Props = {
    children: React.ReactNode;
    args: VanillaLineInformation;
    isXtm: boolean;
};

export const XtmLineViewer = ({ children, args, isXtm }: Props) => {
    return <>
        {!isXtm && children}
    </>
}

export interface VanillaLineInformation {
    width: number
    height: number
    stops: Stop[]
    focused: boolean
    group: string
    tooltipKeys: any[]
    tooltipTags: any[]
    color: Color
    vehicles: Vehicle[]
    segments: Segment[]
    stopCapacity: number
}

export interface Stop {
    entity: Entity
    name: Name
    position: number
    cargo: number
    capacity: number
    type: number
    isOutsideConnection: boolean
}


export interface Color {
    r: number
    g: number
    b: number
    a: number
}

export interface Vehicle {
    entity: Entity
    name: Name
    cargo: number
    capacity: number
    position: number
    type: number
}


export interface Segment {
    start: number
    end: number
    broken: boolean
}
