'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Room {
    id: number;
    room_number: string;
    room_type: string;
    category: string;
    price_per_night: string;
    capacity_adults: number;
    capacity_children: number;
    image_url: string;
    description?: string;
}

interface BookingState {
    room: Room | null;
    checkIn: string;
    checkOut: string;
    adults: number;
    children: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    specialRequests: string;
    selectedActivities: any[];
}

interface BookingContextType {
    state: BookingState;
    setRoom: (room: Room) => void;
    setDates: (checkIn: string, checkOut: string) => void;
    setGuests: (adults: number, children: number) => void;
    setPersonalInfo: (name: string, email: string, phone: string) => void;
    setSpecialRequests: (requests: string) => void;
    toggleActivity: (activity: any) => void;
    resetBooking: () => void;
}

const initialState: BookingState = {
    room: null,
    checkIn: '',
    checkOut: '',
    adults: 2,
    children: 0,
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    specialRequests: '',
    selectedActivities: []
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingState>(initialState);

    const setRoom = (room: Room) => setState(prev => ({ ...prev, room }));
    const setDates = (checkIn: string, checkOut: string) => setState(prev => ({ ...prev, checkIn, checkOut }));
    const setGuests = (adults: number, children: number) => setState(prev => ({ ...prev, adults, children }));
    const setPersonalInfo = (guestName: string, guestEmail: string, guestPhone: string) =>
        setState(prev => ({ ...prev, guestName, guestEmail, guestPhone }));
    const setSpecialRequests = (specialRequests: string) => setState(prev => ({ ...prev, specialRequests }));

    const toggleActivity = (activity: any) => {
        setState(prev => {
            const exists = prev.selectedActivities.find(a => a.id === activity.id && a.type === activity.type);
            if (exists) {
                return { ...prev, selectedActivities: prev.selectedActivities.filter(a => !(a.id === activity.id && a.type === activity.type)) };
            } else {
                return { ...prev, selectedActivities: [...prev.selectedActivities, activity] };
            }
        });
    };

    const resetBooking = () => setState(initialState);

    return (
        <BookingContext.Provider value={{
            state,
            setRoom,
            setDates,
            setGuests,
            setPersonalInfo,
            setSpecialRequests,
            toggleActivity,
            resetBooking
        }}>
            {children}
        </BookingContext.Provider>
    );
}

export function useBooking() {
    const context = useContext(BookingContext);
    if (context === undefined) {
        throw new Error('useBooking must be used within a BookingProvider');
    }
    return context;
}
