import React, { useMemo, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { useCart } from "@/context/CartContext";
import { useFavorites } from "@/context/FavoritesContext";
import { BEST_SELLING } from "@/constants/bestSelling";
import { RECOMMENDED } from "@/constants/recommended";
import { PRODUCTS, type Product as CatalogProduct } from "@/constants/products";
import { CATEGORIES } from "@/constants/categories";
import { resolveImageSource } from "@/utils/resolveImageSource";

type DisplayProduct = {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  imageSource: any;
  categorySlug?: string;
};

function inferCategorySlug(
  product: { id: string; name: string },
  byName: Map<string, string>,
  categorySlugs: Set<string>
) {
  const byNameMatch = byName.get(product.name);
  if (byNameMatch) return byNameMatch;
  if (categorySlugs.has(product.id)) return product.id;
  return undefined;
}

export default function ProductDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = typeof params.id === "string" ? params.id : "";

  const { width } = useWindowDimensions();

  const { addItem, cartCount } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [qty, setQty] = useState(1);

  const categorySlugs = useMemo(
    () => new Set(CATEGORIES.map((c) => c.slug)),
    []
  );

  const categoryByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of PRODUCTS) map.set(p.name, p.categorySlug);
    return map;
  }, []);

  const productMap = useMemo(() => {
    const map = new Map<string, DisplayProduct>();

    for (const p of PRODUCTS) {
      map.set(p.id, p);
    }

    for (const p of BEST_SELLING as any[]) {
      map.set(p.id, {
        ...(map.get(p.id) ?? {}),
        ...p,
        categorySlug: (map.get(p.id) as any)?.categorySlug ??
          inferCategorySlug(p, categoryByName, categorySlugs),
      });
    }

    for (const p of RECOMMENDED as any[]) {
      map.set(p.id, {
        ...(map.get(p.id) ?? {}),
        ...p,
        categorySlug: (map.get(p.id) as any)?.categorySlug ??
          inferCategorySlug(p, categoryByName, categorySlugs),
      });
    }

    return map;
  }, [categoryByName, categorySlugs]);

  const product = id ? productMap.get(id) : undefined;

  const favorite = product ? isFavorite(product.id) : false;

  const similarProducts = useMemo(() => {
    if (!product) return [] as CatalogProduct[];
    const categorySlug = product.categorySlug;
    if (!categorySlug) return [] as CatalogProduct[];

    return PRODUCTS.filter(
      (p) =>
        p.categorySlug === categorySlug &&
        p.id !== product.id &&
        p.name !== product.name
    ).slice(0, 8);
  }, [product]);

  const similarColumnGap = 12;
  const similarColumns = 2;
  const similarItemWidth =
    (width - 32 - similarColumnGap * (similarColumns - 1)) /
    similarColumns;

  const onShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `${product.name} - ${product.price}`,
      });
    } catch {}
  };

  const handleAddToCart = () => {
    if (!product) return;

    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        subtitle: product.subtitle,
        price: product.price,
        imageSource: product.imageSource,
      });
    }
  };

  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
        <View className="flex-1 items-center justify-center">
          <Text className="text-slate-500">Product not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image */}
        <View className="mx-4 mt-2 overflow-hidden rounded-3xl bg-slate-50">
          <View className="h-80 w-full">
            <Image
              source={resolveImageSource(product.imageSource)}
              className="h-full w-full"
              resizeMode="contain"
            />
          </View>

          <View className="absolute left-3 right-3 top-3 flex-row justify-between">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
            >
              <Ionicons name="chevron-back" size={20} />
            </Pressable>

            <View className="flex-row gap-2">
              <Pressable
                onPress={onShare}
                className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
              >
                <Ionicons name="share-outline" size={20} />
              </Pressable>

              <Pressable
                onPress={() => router.push("/cart")}
                className="relative h-10 w-10 items-center justify-center rounded-full bg-white/90"
              >
                <Ionicons name="cart-outline" size={20} />
                {cartCount > 0 && (
                  <View className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1">
                    <Text className="text-[10px] text-white">
                      {cartCount > 99 ? "99+" : cartCount}
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>
          </View>
        </View>

        {/* Title */}
        <View className="mt-5 px-4">
          <Text className="text-2xl font-bold">{product.name}</Text>
          <Text className="text-slate-500">{product.subtitle}</Text>
        </View>

        {/* Qty */}
        <View className="mt-5 flex-row items-center justify-between px-4">
          <View className="flex-row items-center gap-3">
            <Pressable onPress={() => setQty((q) => Math.max(1, q - 1))}>
              <Ionicons name="remove" size={20} />
            </Pressable>

            <Text className="text-lg font-bold">{qty}</Text>

            <Pressable onPress={() => setQty((q) => q + 1)}>
              <Ionicons name="add" size={20} />
            </Pressable>
          </View>

          <Text className="text-xl font-bold">{product.price}</Text>
        </View>

        {/* Favorite */}
        <Pressable
          onPress={() => toggleFavorite(product.id)}
          className="mx-4 mt-4"
        >
          <Ionicons
            name={favorite ? "heart" : "heart-outline"}
            size={24}
            color={favorite ? "red" : "black"}
          />
        </Pressable>

        {/* Similar Products */}
        <View className="mt-6 px-4">
          <Text className="mb-2 text-lg font-bold">
            Similar Products
          </Text>

          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {similarProducts.map((p) => (
              <Pressable
                key={p.id}
                style={{ width: similarItemWidth }}
                onPress={() =>
                  router.push({
                    pathname: "/product/[id]",
                    params: { id: p.id },
                  })
                }
                className="rounded-xl border p-2"
              >
                <Image
                  source={resolveImageSource(p.imageSource)}
                  className="h-20 w-full"
                  resizeMode="cover"
                />
                <Text numberOfLines={1} className="font-semibold">
                  {p.name}
                </Text>
                <Text className="text-green-700">{p.price}</Text>

                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    addItem({
                      id: p.id,
                      name: p.name,
                      subtitle: p.subtitle,
                      price: p.price,
                      imageSource: p.imageSource,
                    });
                  }}
                >
                  <Ionicons name="add-circle" size={24} color="green" />
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View className="flex-row gap-3 border-t p-3">
        <Pressable
          onPress={handleAddToCart}
          className="flex-1 items-center justify-center rounded-xl bg-green-700 py-4"
        >
          <Text className="text-white font-bold">Add to Cart</Text>
        </Pressable>

        <Pressable className="flex-1 items-center justify-center rounded-xl border border-green-700 py-4">
          <Text className="font-bold text-green-700">Buy Now</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}