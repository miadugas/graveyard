import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProduct, fetchProducts } from "@/lib/api";
import type { CreateProductInput, ProductType } from "@/types";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

const typeOptions: ProductType[] = ["sticker", "button", "bundle"];

export function AdminPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [type, setType] = useState<ProductType>("sticker");
  const [price, setPrice] = useState("5.00");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts
  });

  const derivedId = useMemo(() => {
    const base = slugify(name || "new-item");
    return `${type}-${base}`;
  }, [name, type]);

  const createProductMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      setName("");
      setPrice("5.00");
      setDescription("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  });

  function handleCreateProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: CreateProductInput = {
      id: derivedId,
      name: name.trim(),
      type,
      price: Number(price),
      description: description.trim(),
      imageUrl: imageUrl.trim()
    };

    createProductMutation.mutate(payload);
  }

  return (
    <main className="mx-auto w-[min(1120px,92vw)] py-10">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-2xl border border-white/20 bg-zinc-950/90 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Admin</p>
          <h2 className="mt-2 font-display text-3xl text-white">Add Item</h2>
          <p className="mt-2 text-sm text-zinc-300">Create new sticker, button, or bundle in one step.</p>

          <form className="mt-5 grid gap-3" onSubmit={handleCreateProduct}>
            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Name</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setName(event.target.value)}
                required
                type="text"
                value={name}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Type</span>
              <select
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setType(event.target.value as ProductType)}
                value={type}
              >
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Price (USD)</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                min="0"
                onChange={(event) => setPrice(event.target.value)}
                required
                step="0.01"
                type="number"
                value={price}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Description</span>
              <textarea
                className="min-h-24 rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setDescription(event.target.value)}
                required
                value={description}
              />
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-zinc-300">Image URL</span>
              <input
                className="rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-white outline-none ring-white transition focus:ring-1"
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
                type="url"
                value={imageUrl}
              />
            </label>

            <div className="rounded-lg border border-dashed border-white/20 bg-black/25 px-3 py-2 text-xs text-zinc-400">
              Product ID: <span className="font-semibold text-zinc-200">{derivedId}</span>
            </div>

            {createProductMutation.isError ? (
              <p className="text-sm text-zinc-300">{createProductMutation.error.message}</p>
            ) : null}

            <button
              className="mt-1 rounded-full border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:opacity-50"
              disabled={createProductMutation.isPending}
              type="submit"
            >
              {createProductMutation.isPending ? "Saving..." : "Add Product"}
            </button>
          </form>
        </article>

        <article className="rounded-2xl border border-white/20 bg-zinc-950/90 p-5">
          <h3 className="font-display text-2xl text-white">Current Catalog</h3>
          <p className="mt-1 text-sm text-zinc-300">{products.length} products</p>

          <div className="mt-4 max-h-[540px] space-y-2 overflow-y-auto pr-1">
            {products.map((product) => (
              <div className="rounded-xl border border-white/10 bg-black/30 p-3" key={product.id}>
                {product.imageUrl ? (
                  <img
                    alt={product.name}
                    className="mb-2 h-24 w-full rounded-md border border-white/15 object-cover"
                    src={product.imageUrl}
                  />
                ) : null}
                <p className="text-xs uppercase tracking-[0.12em] text-zinc-400">{product.type}</p>
                <p className="font-semibold text-white">{product.name}</p>
                <p className="text-sm text-zinc-300">${product.price.toFixed(2)}</p>
                <p className="mt-1 text-sm text-zinc-300">{product.description}</p>
                <p className="mt-1 text-xs text-zinc-500">{product.id}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}
