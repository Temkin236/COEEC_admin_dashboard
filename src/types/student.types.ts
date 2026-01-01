export type StudentItem = {
    id: number
    program: string
    level: string
    count: number
    male: number
    female: number
}

export type AlumniItem = {
    id: number
    name: string
    program: string
    graduationYear: number
    currentPosition: string
    organization: string
    status: string
}

export type StudentLife = {
    id: string
    heading: string
    description: string | null
    statClubs: string | null
    statInternships: string | null
    statAlumni: string | null
    clubsHeading: string | null
    clubsDescription: string | null
    careerHeading: string | null
    careerDescription: string | null
    updatedAt: string
}

export type Club = {
    id: string
    name: string
    description: string
    websiteUrl: string
    images: string[]
    order: number
}

export type Career = {
    id: string
    title: string
    description: string
    link: string
    order: number
}
