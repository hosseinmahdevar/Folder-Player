/// FolderPlay Domain: Character Entity
class Character {
  final String id;
  final String bookId;
  final String name;
  final String role;
  final String description;
  final String? allegiance;
  final String? colorAccentHex;

  const Character({
    required this.id,
    required this.bookId,
    required this.name,
    required this.role,
    required this.description,
    this.allegiance,
    this.colorAccentHex,
  });
}
