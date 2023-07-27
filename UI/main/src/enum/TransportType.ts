
export enum TransportType {
    None = "None",
    Bus = "Bus",
    Train = "Train",
    Taxi = "Taxi",
    Tram = "Tram",
    Ship = "Ship",
    Post = "Post",
    Helicopter = "Helicopter",
    Airplane = "Airplane",
    Subway = "Subway",
    Rocket = "Rocket",
    Count = "Count"
}

export const TransportTypePriority = [
    TransportType.Rocket,
    TransportType.Airplane,
    TransportType.Helicopter,
    TransportType.Ship,
    TransportType.Post,
    TransportType.Train,
    TransportType.Subway,
    TransportType.Tram,
    TransportType.Bus
]