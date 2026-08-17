import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string;
  image: string;
  features_list: string[];
};

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="bg-muted/50 border-0 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group cursor-pointer">
          <CardHeader className="p-0">
            <div className="aspect-video overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                width={300}
                height={210}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <CardTitle className="text-lg font-bold text-gray-800 mb-2 truncate font-body">{product.name}</CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image Section */}
          <div className="relative h-64 md:h-full">
            <Image
              src={product.image}
              alt={product.name}
              layout="fill"
              objectFit="cover"
              className="rounded-l-lg"
            />
          </div>
          {/* Details Section */}
          <div className="p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-2xl font-bold text-gray-900">{product.name}</DialogTitle>
            </DialogHeader>
            
            <h4 className="text-md font-semibold text-gray-700 mb-2">Description</h4>
            <p className="text-sm text-gray-600 mb-4">{product.description}</p>

            <h4 className="text-md font-semibold text-gray-700 mb-2">Key Features</h4>
            <ul className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {product.features_list.map((feature, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-teal-500 mr-2 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            
            <div className="mt-6">
              <Badge className="bg-teal-500 hover:bg-teal-600 text-white">Explore Now</Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}