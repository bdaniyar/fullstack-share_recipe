import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Heart } from "lucide-react"; // For likes icon

export default function RecipeCard({ recipe }) {
  return (
    <Card className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={recipe.image || "/home-image.jpg"}
        alt={recipe.title}
        className="w-full md:w-36 md:h-36 h-60 object-cover"
      />
      <CardContent className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <CardTitle className="text-xl text-yellow-500">{recipe.title}</CardTitle>
          <CardDescription className="text-gray-700 mt-2">
            {recipe.description.slice(0, 100)}...
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-4 items-center mt-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span>{recipe.likes} </span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
          <span>Created: {new Date(recipe.created_at).toLocaleDateString()}</span>
          <span>
            {recipe.is_published ? (
              <span className="text-green-600 font-medium">Published</span>
            ) : (
              <span className="text-red-500 font-medium">Draft</span>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
