import Link from "next/link";
import Image from "next/image";
import { fullName } from "@/utils/formatName";

export default function BlogCard({ blog }) {
    return (
        <article
            key={blog._id}
            className="bg-white border rounded-xl overflow-hidden max-h-[530px]"
        >
            {blog.bannerImage &&
            blog.bannerImage !== null &&
            blog.bannerImage !== undefined ? (
                <div className="h-48 relative rounded-t-xl">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_PHOTO_API.replace("photoId", blog.bannerImage)}`}
                        alt={blog.title}
                        fill
                        className="object-cover rounded-t-xl"
                        unoptimized
                        loading="lazy"
                    />
                </div>
            ) : (
                <div className="h-48 relative rounded-t-xl" />
            )}

            <div className="p-6">
                {blog.category && (
                    <Link
                        href={`${process.env.NEXT_PUBLIC_CATEGORY}/${blog.category?.slug}`}
                        className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4 hover:underline"
                    >
                        {blog.category?.name}
                    </Link>
                )}

                <Link
                    href={`${process.env.NEXT_PUBLIC_BLOG}/${blog.slug}`}
                    className="text-2xl text-black font-bold mb-3 line-clamp-2 hover:underline"
                >
                    {blog.title}
                </Link>

                {blog.author && (
                    <Link
                        href={`${process.env.NEXT_PUBLIC_AUTHOR}/${blog.author._id}`}
                        className="flex items-center mb-4 text-sm text-gray-500 hover:text-gray-700 hover:underline"
                    >
                        {blog?.author?.profilePhoto && (
                            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2 flex-shrink-0 relative overflow-hidden">
                                <Image
                                    src={`${process.env.NEXT_PUBLIC_PHOTO_API.replace("photoId", blog.author.profilePhoto)}`}
                                    alt="Profile"
                                    fill
                                    className="rounded-full object-cover  object-center overflow-hidden"
                                    loading="lazy"
                                    unoptimized
                                />
                            </div>
                        )}
                        <span>
                            {fullName(
                                blog.author?.firstName,
                                blog.author?.lastName,
                            )}
                        </span>
                    </Link>
                )}

                {blog.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {blog.tags.map((tag, idx) => (
                            <Link
                                key={tag?._id || idx}
                                href={`${process.env.NEXT_PUBLIC_TAG}/${tag?._id}`}
                                className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full hover:bg-gray-200"
                            >
                                {tag?.name}
                            </Link>
                        ))}
                    </div>
                )}

                <p className="text-gray-600 mb-3 line-clamp-3">
                    {blog?.content}...
                </p>
                <Link
                    href={`${process.env.NEXT_PUBLIC_BLOG}/${blog.slug}`}
                    className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                >
                    Read More →
                </Link>
            </div>
        </article>
    );
}
