"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Room = {
  id: string;
  name: string;
};

const RoomsPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("*")
        .order("created_at");
      if (data) setRooms(data);
    };
    fetchRooms();
  }, []);

  const createRoom = async () => {
    if (!newRoomName.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("You must be logged in.");

    const { data, error } = await supabase
      .from("rooms")
      .insert([{ name: newRoomName, created_by: user.id }])
      .select();

    if (error) {
      alert("Błąd tworzenia pokoju: " + error.message);
    } else {
      setNewRoomName("");
      setRooms((prev) => [...prev, data[0]]);
    }
  };

  return (
    <section className="min-h-screen w-full p-8 flex flex-col items-center">
      <Card className="w-full max-w-2xl mb-8">
        <CardHeader>
          <CardTitle>Create a new room</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            placeholder="Room Name (e.g. General)"
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <Button onClick={createRoom}>Create room</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-4xl">
        {rooms.map((room) => (
          <Card
            key={room.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(`/rooms/${room.id}`)}
          >
            <CardHeader>
              <CardTitle># {room.name}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default RoomsPage;
