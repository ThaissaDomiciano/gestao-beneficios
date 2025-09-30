'use client'

import { Calendar } from "@/components/ui/calendar"
import { CalendarDays } from "lucide-react"
import * as React from "react"


export default function Agendamento() {
    const [date, setDate] = React.useState<Date | undefined>(new Date())

    return (
        <main className="min-h-screen w-screen max-w-none">
            <div className="w-full px-6 sm:px-10 lg:px-16 xl:px-24 2xl:px-32">
                <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[var(--verde-900)] bg-[var(--cinza-100)] px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-full bg-[var(--verde-600)] border-2 border-[var(--verde-900)]">
                        <CalendarDays></CalendarDays>
                        </div>
                        <h1 className="text-3xl font-semibold text-[var(--cinza-700)]">Agendamento</h1>
                    </div>
                </div>
                <div className="mt-8 w-full rounded-2xl border border-[var(--verde-900)] bg-[var(--cinza-100)] p-8 md:p-12 shadow-sm">
                 <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow-sm"
                            captionLayout="dropdown"
                            />
                </div>
            </div>
        </main>
    )

}

