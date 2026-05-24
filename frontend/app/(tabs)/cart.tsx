import React, { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { usePathname, useRouter } from "expo-router";
import { useCart } from "@/context/CartContext";
import { resolveImageSource } from "@/utils/resolveImageSource";

const PROMO_CODE = "FESTIVE20";
const DISCOUNT_RATE = 0.2;
const DELIVERY_FEE = 150;
const TAX_RATE = 0.025;

type CartItem = ReturnType<typeof useCart>["cartItems"][number];

const formatLkr = (value: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(value);

function CartCard({
  item,
  onRemove,
  onIncrement,
  onDecrement,
}: {
  item: CartItem;
  onRemove: (id: string) => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
}) {
  const subtotal = Number(item.price.replace(/[^0-9.]/g, "")) || 0;
  const savings = subtotal * 0.1;

  return (
    <View className="flex-row overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <View className="h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
        <Image
          source={resolveImageSource(item.imageSource)}
          style={{ width: 80, height: 80 }}
          contentFit="cover"
          accessibilityLabel={item.name}
        />
      </View>

      <View className="ml-4 flex-1">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-base font-bold text-slate-900" numberOfLines={2}>
              {item.name}
            </Text>
            <Text className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {item.subtitle}
            </Text>
          </View>

          <Pressable
            onPress={() => onRemove(item.id)}
            className="h-9 w-9 items-center justify-center rounded-full bg-slate-50"
          >
            <Ionicons name="trash-outline" size={18} color="#475569" />
          </Pressable>
        </View>

        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-lg font-extrabold text-emerald-700">
              {item.price}
            </Text>
            <Text className="mt-1 text-xs font-semibold text-emerald-600">
              Saved {formatLkr(savings)}
            </Text>
          </View>

          <View className="flex-row items-center rounded-full border border-slate-200 bg-slate-50 px-1 py-1">
            <Pressable
              onPress={() => onDecrement(item.id)}
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="remove" size={18} color="#15803d" />
            </Pressable>

            <Text className="min-w-[28px] px-2 text-center text-sm font-bold text-slate-900">
              {item.quantity}
            </Text>

            <Pressable
              onPress={() => onIncrement(item.id)}
              className="h-8 w-8 items-center justify-center rounded-full bg-white"
            >
              <Ionicons name="add" size={18} color="#15803d" />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function CartScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    cartItems,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    cartCount,
  } = useCart();

  const [promoCode, setPromoCode] = useState("FESTIVE20");
  const [appliedCode, setAppliedCode] = useState("FESTIVE20");

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          (Number(item.price.replace(/[^0-9.]/g, "")) || 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const bundleSavings = useMemo(() => subtotal * 0.1, [subtotal]);

  const promoDiscount =
    appliedCode === PROMO_CODE ? subtotal * DISCOUNT_RATE : 0;

  const taxes = subtotal * TAX_RATE;
  const total = subtotal - promoDiscount + DELIVERY_FEE + taxes;

  const handleApplyPromo = () => {
    setAppliedCode(promoCode.trim().toUpperCase());
  };

  return (
    <View className="flex-1 bg-[#f7fbf0]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
        {cartItems.map((item) => (
          <CartCard
            key={item.id}
            item={item}
            onRemove={removeItem}
            onIncrement={incrementItem}
            onDecrement={decrementItem}
          />
        ))}

        <View className="mt-6">
          <Text className="text-lg font-bold">Total: {formatLkr(total)}</Text>
        </View>
      </ScrollView>

      <Pressable
        onPress={clearCart}
        className="absolute bottom-10 left-4 right-4 h-14 items-center justify-center rounded-2xl bg-emerald-700"
      >
        <Text className="text-white font-bold">Checkout</Text>
      </Pressable>
    </View>
  );
}