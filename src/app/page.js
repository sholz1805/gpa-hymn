import HymnLibrary from "../components/hymn-library";

export const metadata = {
  title: "GPA Church Hymn Book",
  description:
    "Browse the GPA church hymn book in English and Yoruba by topic, number, and title.",
};

export default function Home() {
  return <HymnLibrary />;
}
