import { useState } from 'react'
import { useData } from '../contexts/DataContext'
import { X, Camera } from 'lucide-react'

function GalleryPage() {
  const { galleryPhotos, galleryCategories } = useData()
  const [activeCategory, setActiveCategory] = useState('all')
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  const visiblePhotos = galleryPhotos.filter(p => p.visible !== false)
  const categories = [{ id: 'all', name: '全部' }, ...galleryCategories]

  const filteredPhotos = activeCategory === 'all'
    ? visiblePhotos
    : visiblePhotos.filter(photo => photo.category === activeCategory)

  return (
    <div className="bg-stone-50 text-stone-800">
      {/* Page Banner */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/60 to-stone-900/80 z-10"></div>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1548625361-12b704c38d39?q=80&w=2000&auto=format&fit=crop')`
          }}
        ></div>
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">相簿</h1>
          <p className="text-lg text-stone-200 tracking-widest">廟宇風采 · 活動紀錄</p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-red-800 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative aspect-square bg-stone-200 rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <h3 className="text-white font-bold">{photo.title}</h3>
                  <p className="text-stone-300 text-sm">{photo.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredPhotos.length === 0 && (
            <div className="text-center py-20">
              <Camera className="mx-auto text-stone-300 mb-4" size={48} />
              <p className="text-stone-500">此分類目前無照片</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-amber-400 transition-colors"
            onClick={() => setSelectedPhoto(null)}
          >
            <X size={32} />
          </button>

          <div
            className="max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPhoto.image}
              alt={selectedPhoto.title}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />
            <div className="text-center mt-6">
              <h3 className="text-white text-xl font-bold mb-2">{selectedPhoto.title}</h3>
              <p className="text-stone-400">{selectedPhoto.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Notice */}
      <section className="py-16 bg-amber-50">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <Camera className="mx-auto text-amber-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-stone-900 mb-4">分享您的照片</h3>
            <p className="text-stone-600">
              歡迎信眾分享參拜或活動照片，與大家共享三官寶殿的美好時刻。
              如有照片想要分享，請聯繫廟方服務處。
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default GalleryPage
