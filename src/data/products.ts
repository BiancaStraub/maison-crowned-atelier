export interface ProductImages {
  front: string;
  back: string;
  pose: string;
  detail: string;
}

export interface Product {
  id: string;
  name: string;
  subtitle: string;
  fabric: string;
  color: string;
  collection: 'masculina' | 'feminina';
  price: number;
  description: string;
  images: ProductImages;
}

function makeImages(slug: string): ProductImages {
  return {
    front: `/produtos/${slug}-frente.jpg`,
    back: `/produtos/${slug}-costas.jpg`,
    pose: `/produtos/${slug}-pose.jpg`,
    detail: `/produtos/${slug}-detalhe.jpg`,
  };
}

export const products: Product[] = [
  // Coleção Masculina
  { id: 'officer', name: 'OFFICER', subtitle: 'Costume Moderno', fabric: 'Wool', color: 'Green Military', collection: 'masculina', price: 12500, description: 'Um costume moderno em lã verde militar, cortado com precisão cirúrgica para silhuetas contemporâneas.', images: makeImages('officer') },
  { id: 'riviera', name: 'RIVIERA', subtitle: 'Blazer & Calça Linho', fabric: 'Linen', color: 'Beige/White', collection: 'masculina', price: 9800, description: 'Linho italiano em tons de areia e branco, evocando tardes na Côte d\'Azur.', images: makeImages('riviera') },
  { id: 'prestige', name: 'PRESTIGE', subtitle: 'Terno 3 Peças', fabric: 'Wool', color: 'Black', collection: 'masculina', price: 15000, description: 'O terno definitivo em três peças. Lã preta com caimento impecável.', images: makeImages('prestige') },
  { id: 'solare', name: 'SOLARE', subtitle: 'Chino & Camisa', fabric: 'Cotton/Linen', color: 'Nude/Salmon', collection: 'masculina', price: 7500, description: 'Algodão e linho em tons solares. Elegância descontraída sem concessões.', images: makeImages('solare') },
  { id: 'urban-coat', name: 'URBAN COAT', subtitle: 'Sobretudo Leve', fabric: 'Wool', color: 'Beige', collection: 'masculina', price: 11000, description: 'Sobretudo em lã leve bege. A peça de transição por excelência.', images: makeImages('urban-coat') },
  { id: 'monolith', name: 'MONOLITH', subtitle: 'Total Black Look', fabric: 'Linen & Wool', color: 'Black', collection: 'masculina', price: 13500, description: 'Total black em linho e lã. Monolítico, absoluto, sem apelo ao decorativo.', images: makeImages('monolith') },
  { id: 'garden-slim', name: 'GARDEN SLIM', subtitle: 'Blazer Soft', fabric: 'Crepe/Linen', color: 'Rose/Beige', collection: 'masculina', price: 8900, description: 'Blazer em crepe e linho, tons rosé e bege. Suavidade estruturada.', images: makeImages('garden-slim') },
  { id: 'gran-gala', name: 'GRAN GALA', subtitle: 'Paletó Double Breasted', fabric: 'Zibeline', color: 'Black', collection: 'masculina', price: 18000, description: 'Double breasted em zibeline preta. Para momentos que exigem autoridade.', images: makeImages('gran-gala') },
  { id: 'safari-chic', name: 'SAFARI CHIC', subtitle: 'Camisa Guayabera', fabric: 'Cotton', color: 'Green Military', collection: 'masculina', price: 7500, description: 'Guayabera reinventada em algodão verde militar. Exploração refinada.', images: makeImages('safari-chic') },
  { id: 'pure-alba', name: 'PURE ALBA', subtitle: 'Look Total White', fabric: 'Cotton/Linen', color: 'White', collection: 'masculina', price: 9500, description: 'Total white em algodão e linho. Pureza radical como declaração.', images: makeImages('pure-alba') },

  // Coleção Feminina
  { id: 'militarre', name: 'MILITARRE', subtitle: 'Tailleur Estruturado', fabric: 'Wool', color: 'Green Military', collection: 'feminina', price: 13000, description: 'Tailleur em lã verde militar. Estrutura e poder em cada costura.', images: { front: '/produtos/militarre-frente.png', back: '/produtos/militarre-costas.png', pose: '/produtos/militarre-pose.png', detail: '/produtos/militarre-detalhe.png' } },
  { id: 'noir-sculpt', name: 'NOIR SCULPT', subtitle: 'Vestido Midi Gala', fabric: 'Zibeline', color: 'Black', collection: 'feminina', price: 14500, description: 'Vestido midi em zibeline preta. Escultura têxtil para noites de gala.', images: { front: '/produtos/noir-sculpt-frente.png', back: '/produtos/noir-sculpt-costas.png', pose: '/produtos/noir-sculpt-pose.png', detail: '/produtos/noir-sculpt-detalhe.png' } },
  { id: 'essenza', name: 'ESSENZA', subtitle: 'Conjunto Pantalona', fabric: 'Crepe/Linen', color: 'Nude/Beige', collection: 'feminina', price: 11000, description: 'Pantalona e blusa em crepe e linho. A essência da fluidez elegante.', images: { front: '/produtos/essenza-frente.png', back: '/produtos/essenza-costas.png', pose: '/produtos/essenza-pose.png', detail: '/produtos/essenza-detalhe.png' } },
  { id: 'breeze', name: 'BREEZE', subtitle: 'Chemise & Shorts', fabric: 'Linen', color: 'White/Beige', collection: 'feminina', price: 8500, description: 'Chemise e shorts em linho branco e bege. Brisa marítima materializada.', images: { front: '/produtos/breeze-frente.png', back: '/produtos/breeze-costas.png', pose: '/produtos/breeze-pose.png', detail: '/produtos/breeze-detalhe.png' } },
  { id: 'lopera', name: "L'OPERA", subtitle: 'Saia Lápis & Blusa', fabric: 'Zibeline/Crepe', color: 'Black/Rose', collection: 'feminina', price: 12000, description: 'Saia lápis e blusa em zibeline e crepe. Drama contido para noites culturais.', images: makeImages('lopera') },
  { id: 'ambassador', name: 'AMBASSADOR', subtitle: 'Blazer Oversized', fabric: 'Wool', color: 'Beige', collection: 'feminina', price: 10500, description: 'Blazer oversized em lã bege. Autoridade sem esforço aparente.', images: makeImages('ambassador') },
  { id: 'aura', name: 'AURA', subtitle: 'Wide Leg Set', fabric: 'Crepe', color: 'Salmon', collection: 'feminina', price: 9800, description: 'Wide leg em crepe salmão. Aura de leveza e presença.', images: makeImages('aura') },
  { id: 'utility-luxe', name: 'UTILITY LUXE', subtitle: 'Macacão Alfaiataria', fabric: 'Cotton', color: 'Green Military', collection: 'feminina', price: 11500, description: 'Macacão em algodão verde militar. Utilidade elevada a luxo.', images: makeImages('utility-luxe') },
  { id: 'fluide', name: 'FLUIDE', subtitle: 'Saia Midi & Camisa', fabric: 'Crepe/Cotton', color: 'Rose/White', collection: 'feminina', price: 9000, description: 'Saia midi e camisa em crepe e algodão. Fluido, rosé, intocável.', images: makeImages('fluide') },
  { id: 'tux-femme', name: 'TUX FEMME', subtitle: 'Smoking Feminino', fabric: 'Wool', color: 'Black', collection: 'feminina', price: 16000, description: 'Smoking feminino em lã preta. Subversão clássica, precisão absoluta.', images: makeImages('tux-femme') },
];

export const formatPrice = (price: number): string => {
  return `R$ ${price.toLocaleString('pt-BR')},00`;
};
