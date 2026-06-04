## Metadata Packages Downloads index

This repository contains the `index.json` file used for [the Metadata Packages Downloads page](https://dhis2.org/metadata-package-downloads).

The `index.json` file is updated through the [dhis2-metadata/downloads-index-updater](https://github.com/dhis2-metadata/downloads-index-updater) script.

The corresponding download "widget" is available at: https://dhis2-metadata.github.io/downloads-index/

## `index.json` structure

The `index.json` file contains a top-level `areas` array.

Each area contains one or more packages. Each package contains one or more package versions. Each package version contains one or more translations. Each translation contains one or more DHIS2-version-specific download entries.

The nesting is:

`areas` → `packages` → `packageVersions` → `translations` → `dhis2Versions`

## Schema

### Top-level object

- `areas` (`array`, required): Ordered list of metadata package areas.

### Area object

Each item in `areas` has:

- `area` (`string`, required): Human-readable area name shown in the UI.
- `code` (`string`, required): Stable unique identifier for the area.
- `hidden` (`boolean`, optional): If `true`, the area is hidden from normal display.
- `packages` (`array`, required): Ordered list of packages in this area.

Example:

```json
{
  "area": "HIV",
  "code": "HIV",
  "packages": []
}
```

### Package object

Each item in `packages` has:

- `name` (`string`, required): Human-readable package name.
- `code` (`string`, required): Stable unique identifier for the package.
- `packageVersions` (`array`, required): Ordered list of released versions for the package.

Example:

```json
{
  "name": "HIV HMIS (agg)",
  "code": "HIV_AGG",
  "packageVersions": []
}
```

### Package version object

Each item in `packageVersions` has:

- `version` (`string`, required): Package version number.
- `releaseDate` (`string`, required): Release date in `YYYY-MM-DD` format.
- `translations` (`array`, required): Ordered list of available language variants for this package version.

Example:

```json
{
  "version": "2.0.2",
  "releaseDate": "2024-08-30",
  "translations": []
}
```

### Translation object

Each item in `translations` has:

- `language` (`string`, required): Language code, for example `en`, `fr`, or `es`.
- `dhis2Versions` (`array`, required): Ordered list of DHIS2-version-specific package files for this translation.

Example:

```json
{
  "language": "en",
  "dhis2Versions": []
}
```

### DHIS2 version object

Each item in `dhis2Versions` has:

- `version` (`string`, required): Target DHIS2 version, for example `2.40`.
- `metadataReference` (`string`, required): URL to the metadata reference spreadsheet.
- `url` (`string`, required): URL to the downloadable package archive.

Example:

```json
{
  "version": "2.40",
  "metadataReference": "https://packages.dhis2.org/en/HIV_AGG/2.0.2/DHIS2.40/HIV_AGG_COMPLETE_2.0.2_DHIS2.40.xlsx",
  "url": "https://packages.dhis2.org/en/HIV_AGG/2.0.2/DHIS2.40/HIV_AGG_2.0.2_DHIS2.40.zip"
}
```

## Full example

```json
{
  "areas": [
    {
      "area": "HIV",
      "code": "HIV",
      "packages": [
        {
          "name": "HIV HMIS (agg)",
          "code": "HIV_AGG",
          "packageVersions": [
            {
              "version": "2.0.2",
              "releaseDate": "2024-08-30",
              "translations": [
                {
                  "language": "en",
                  "dhis2Versions": [
                    {
                      "version": "2.40",
                      "metadataReference": "https://packages.dhis2.org/en/HIV_AGG/2.0.2/DHIS2.40/HIV_AGG_COMPLETE_2.0.2_DHIS2.40.xlsx",
                      "url": "https://packages.dhis2.org/en/HIV_AGG/2.0.2/DHIS2.40/HIV_AGG_2.0.2_DHIS2.40.zip"
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

## Editing guidance

When updating `index.json`:

- Preserve the nesting order exactly: `areas` → `packages` → `packageVersions` → `translations` → `dhis2Versions`.
- Ordering matters. The arrays are used directly in the UI, so entries appear in the same order as they are listed in `index.json`.
- Treat `code` values as stable identifiers. Do not rename existing codes unless the consumer of this file is also updated accordingly.
- Use `releaseDate` in `YYYY-MM-DD` format.
- Use standard language codes such as `en`, `fr`, and `es`.
- Ensure all `metadataReference` and `url` values are valid and point to the correct package assets.
- Only use `hidden: true` when an area should not be shown in the normal UI.
- Prefer adding new entries to the correct existing area or package rather than duplicating areas or package codes.
- In normal published data, arrays such as `packages`, `packageVersions`, `translations`, and `dhis2Versions` should usually contain at least one item. Empty arrays may be useful in examples, but should generally be avoided in the real index.
- Keep naming and code conventions consistent with existing entries.
