import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

type CourseCardProps = {
  title: string;
  image: string;
  dataAiHint: string;
  duration: string;
  price: string;
};

export function CourseCard({ title, image, dataAiHint, duration, price }: CourseCardProps) {
  return (
    <Card className="bg-muted/50 border-0 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group">
      <CardHeader className="p-0">
        <div className="aspect-video overflow-hidden">
            <Image
                src={image}
                alt={title}
                width={300}
                height={210}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                data-ai-hint={dataAiHint}
            />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg font-bold text-gray-800 mb-2 truncate font-body">{title}</CardTitle>
        <div className="flex items-center text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span className="text-sm">{duration}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <p className="text-lg font-bold text-gray-800">Price - ₹ {price}</p>
      </CardFooter>
    </Card>
  );
}
