# Dawker API

This contains information about the DTOs and endpoints in the Dawker service.

[Description](#Description)  
[Basics](#Basics)  
[Complex](#Complex)

---

# Description

Each `User` has a list of their `Presets`. Each `Preset` has a list of `GearItems` and `Categories` associated with it.
Each `GearItem` in a `Preset` has its own configuration in `PresetGear` and each `Category` in a `Preset` has its own configuration in `PresetCategory`.

All the `GearItems` and `Categories` are predefined and can be used by all `Users`. They cannot be created, modified, or deleted.

#### Relationships
- User : Preset (1:N)
- Preset : Category (N:N)
  - PresetCategory is the JOIN table
    - Preset : PresetCategory (1:N)
    - Category : PresetCategory (1:N)
- Preset : GearItem (N:N)
  - PresetGear is the JOIN table
    - Preset : PresetGear (1:N)
    - GearItem : PresetGear (1:N)

[Back to top](#dawker-api)

---

# Basics

## DTOs (with ID)
###### -> Used with GET requests

### UserDTO
```java
public record UserDTO (  
    Long id,  
    String username,  
    String role,  
    List<Long> presetIds  
){}
```
Fields:
- id – Unique identifier of the user.
- username – User’s name or login.
- role – Role of the user.
- presetIds – List of IDs of presets associated with the user.

### PresetDTO
```java
public record PresetDTO (  
    Long id,  
    Long userId,  
    String presetName,  
    List<Long> presetGearIds,  
    List<Long> presetCategoryIds  
){}
```
Fields:
- id – Unique identifier of the preset.
- userId – ID of the user who owns the preset.
- presetName – Name of the preset.
- presetGearIds – List of IDs of gear items linked to the preset.
- presetCategoryIds – List of IDs of categories linked to the preset.

### GearItemDTO
```java
public record GearItemDTO (
    Long id,
    String modelName,
    String gearType,
    List<Long> presetGearIds
){}
```
Fields:
- id – Unique identifier of the gear item.
- modelName – Model name of the gear.
- gearType – Type of gear.
- presetGearIds – List of presetGear IDs this gear item is linked to.

### CategoryDTO
```java
public record CategoryDTO (
    Long id,
    String categoryType,
    List<Long> presetCategoryIds
){}
```
Fields:
- id – Unique identifier of the category.
- categoryType – Name/type of the category.
- presetCategoryIds – List of presetCategory IDs linked to this category.

### PresetGearDTO
```java
public record PresetGearDTO (
    Long id,
    Long presetId,
    Long gearItemId,
    Double gainValue,
    Double toneValue,
    Integer orderIndex
){}
```
Fields:
- id – Unique identifier for this preset-gear mapping.
- presetId – ID of the preset this gear belongs to.
- gearItemId – ID of the gear item.
- gainValue – Gain value for the gear in the preset.
- toneValue – Tone value for the gear in the preset.
- orderIndex – Display/order index of this gear in the preset.

### PresetCategoryDTO
```java
public record PresetCategoryDTO (
    Long id,
    Long presetId,
    Long categoryId
){}
```
Fields:
- id – Unique identifier for this preset-category mapping.
- presetId – ID of the preset.
- categoryId – ID of the category associated with the preset.

<br>

## DTOs (without ID)
###### -> Used with POST and PUT requests
###### -> Same as with ID except doesn't include the ID field
###### &emsp; -> Exception: User without ID also includes a `password` field

### UserWOIDDTO
```java
public record UserWOIDDTO (  
    String username,
    String password,
    String role,  
    List<Long> presetIds  
){}
```
Fields:
- username – User’s name or login.
- password – User's password.
- role – Role of the user.
- presetIds – List of IDs of presets associated with the user.

### PresetWOIDDTO
```java
public record PresetWOIDDTO (  
    Long userId,  
    String presetName,  
    List<Long> presetGearIds,  
    List<Long> presetCategoryIds  
){}
```
Fields:
- userId – ID of the user who owns the preset.
- presetName – Name of the preset.
- presetGearIds – List of IDs of gear items linked to the preset.
- presetCategoryIds – List of IDs of categories linked to the preset.

### GearItemWOIDDTO
```java
public record GearItemWOIDDTO (
    String modelName,
    String gearType,
    List<Long> presetGearIds
){}
```
Fields:
- modelName – Model name of the gear.
- gearType – Type of gear.
- presetGearIds – List of presetGear IDs this gear item is linked to.

### CategoryWOIDDTO
```java
public record CategoryWOIDDTO (
    String categoryType,
    List<Long> presetCategoryIds
){}
```
Fields:
- categoryType – Name/type of the category.
- presetCategoryIds – List of presetCategory IDs linked to this category.

### PresetGearWOIDDTO
```java
public record PresetGearWOIDDTO (
    Long presetId,
    Long gearItemId,
    Double gainValue,
    Double toneValue,
    Integer orderIndex
){}
```
Fields:
- presetId – ID of the preset this gear belongs to.
- gearItemId – ID of the gear item.
- gainValue – Gain value for the gear in the preset.
- toneValue – Tone value for the gear in the preset.
- orderIndex – Display/order index of this gear in the preset.

### PresetCategoryWOIDDTO
```java
public record PresetCategoryWOIDDTO (
    Long presetId,
    Long categoryId
){}
```
Fields:
- presetId – ID of the preset.
- categoryId – ID of the category associated with the preset.

[Back to top](#dawker-api)

## Endpoints

### UserController
**Base Path:** /api/users

#### 1. Find user by ID
- GET /api/users?id={id}
- Response:
  ```json
  {
  "id": 1,
  "username": "john_doe",
  "role": "USER",
  "presetIds": [10, 11]
  }
  ```

#### 2. Find user by username
- GET /api/users?username={username}
- Response:
  ```json
  {
  "id": 1,
  "username": "john_doe",
  "role": "USER",
  "presetIds": [10, 11]
  }
  ```

#### 3. Check if username exists
- GET /api/users/exists?modelName={modelName}
- Response:
  ```json
  true
  ```

#### 4. Search users by username
- GET /api/users?search={searchTerm}
- Response:
  ```json
  [
  {
  "id": 1,
  "username": "john_doe",
  "role": "USER",
  "presetIds": [10, 11]
  },
  {
  "id": 2,
  "username": "jane_doe",
  "role": "USER",
  "presetIds": [12]
  }
  ]
  ```

#### 5. Create user
- POST /api/users
- Request Body:
  ```json
  {
  "username": "john_doe",
  "password": "pw",
  "role": "USER",
  "presetIds": [10, 11]
  }
  ```
- Response: same as GET by ID

#### 6. Update user
- PUT /api/users?id={id}
- Request Body: same as create
- Response: same as GET by ID

#### 7. Delete user
- DELETE /api/users?id={id}
- Response: 204 NO CONTENT

<br>

### PresetController
**Base Path:** /api/presets

#### 1. Find preset by ID
- GET /api/presets?id={id}
- Response:
```json
{
  "id": 1,
  "userId": 2,
  "presetName": "Rock Lead",
  "presetGearIds": [10, 11],
  "presetCategoryIds": [5, 6]
}
```

#### 2. Find presets by user ID
- GET /api/presets?userId={userId}
- Response:
```json
[
  {
    "id": 1,
    "userId": 2,
    "presetName": "Rock Lead",
    "presetGearIds": [10, 11],
    "presetCategoryIds": [5, 6]
  },
  {
    "id": 2,
    "userId": 2,
    "presetName": "Blues Rhythm",
    "presetGearIds": [12],
    "presetCategoryIds": [6]
  }
]
```

#### 3. Find preset by user ID and preset name
- GET /api/presets?userId={userId}&name={name}
- Response:
```json
{
  "id": 1,
  "userId": 2,
  "presetName": "Rock Lead",
  "presetGearIds": [10, 11],
  "presetCategoryIds": [5, 6]
}
```

#### 4. Find presets by category ID
- GET /api/presets?categoryId={categoryId}
- Response:
```json
[
  {
    "id": 1,
    "userId": 2,
    "presetName": "Rock Lead",
    "presetGearIds": [10, 11],
    "presetCategoryIds": [5, 6]
  }
]
```

#### 5. Find presets by user ID and category ID
- GET /api/presets?userId={userId}&categoryId={categoryId}
- Response:
```json
[
  {
    "id": 1,
    "userId": 2,
    "presetName": "Rock Lead",
    "presetGearIds": [10, 11],
    "presetCategoryIds": [5, 6]
  }
]
```

#### 6. Create preset
- POST /api/presets
- Request Body:
```json
{
  "userId": 2,
  "presetName": "Rock Lead",
  "presetGearIds": [10, 11],
  "presetCategoryIds": [5, 6]
}
```
- Response: same as GET by ID

#### 7. Update preset
- PUT /api/presets?id={id}
- Request Body: same as create
- Response: same as GET by ID

#### 8. Delete preset
- DELETE /api/presets?id={id}
- Response: 204 NO CONTENT

<br>

### GearItemController
Base Path: /api/gearitems

#### 1. Find gear item by ID
- GET /api/gearitems?id={id}
- Response:
```json
{
  "id": 10,
  "modelName": "Fender Stratocaster",
  "gearType": "Guitar",
  "presetGearIds": [10, 12]
}
```

#### 2. Find gear items by type
- GET /api/gearitems?type={type}
- Response:
```json
[
  {
    "id": 10,
    "modelName": "Fender Stratocaster",
    "gearType": "Guitar",
    "presetGearIds": [10, 12]
  }
]
```

#### 3. Find gear item by model name
- GET /api/gearitems?modelName={modelName}
- Response:
```json
{
  "id": 10,
  "modelName": "Fender Stratocaster",
  "gearType": "Guitar",
  "presetGearIds": [10, 12]
}
```

#### 4. Check if gear model exists
- GET /api/gearitems/exists?modelName={modelName}
- Response:
```json
true
```

<br>

### CategoryController
Base Path: /api/categories

#### 1. Find category by ID
- GET /api/categories?id={id}
- Response:
```json
{
  "id": 5,
  "categoryType": "Lead",
  "presetCategoryIds": [1, 2]
}
```

#### 2. Find category by type
- GET /api/categories?type={type}
- Response:
```json
{
  "id": 5,
  "categoryType": "Lead",
  "presetCategoryIds": [1, 2]
}
```

#### 3. Check if category type exists
- GET /api/categories/exists?type={type}
- Response:
```json
true
```

<br>

### PresetGearController
Base Path: /api/presetgears

#### 1. Find preset gear by ID
- GET /api/presetgears?id={id}
- Response:
```json
{
  "id": 10,
  "presetId": 1,
  "gearItemId": 10,
  "gainValue": 7.5,
  "toneValue": 8.0,
  "orderIndex": 1
}
```

#### 2. Find preset gears by preset ID
- GET /api/presetgears?presetId={presetId}
- Response:
```json
[
  {
    "id": 10,
    "presetId": 1,
    "gearItemId": 10,
    "gainValue": 7.5,
    "toneValue": 8.0,
    "orderIndex": 1
  }
]
```

#### 3. Find preset gears by gear item ID
- GET /api/presetgears?gearItemId={gearItemId}
- Response:
```json
[
  {
    "id": 10,
    "presetId": 1,
    "gearItemId": 10,
    "gainValue": 7.5,
    "toneValue": 8.0,
    "orderIndex": 1
  }
]
```

#### 4. Count preset gears by gear item ID
- GET /api/presetgears/count?gearItemId={gearItemId}
- Response:
```json
5
```

#### 5. Find most popular gear items
- GET /api/presetgears/popular (returns the 10 most popular gear items)
- Response:
```json
{
  "10": 5,
  "12": 3
}
```

- GET /api/presetgears/popular?numMostPopular={num}
- Response:
```json
{
  "10": 5,
  "12": 3
}
```

#### 6. Find preset gears by gear type
- GET /api/presetgears?type={type}
- Response:
```json
[
  {
    "id": 10,
    "presetId": 1,
    "gearItemId": 10,
    "gainValue": 7.5,
    "toneValue": 8.0,
    "orderIndex": 1
  }
]
```

#### 7. Create preset gear
- POST /api/presetgears
- Request Body:
```json
{
  "presetId": 1,
  "gearItemId": 10,
  "gainValue": 7.5,
  "toneValue": 8.0,
  "orderIndex": 1
}
```
- Response: same as GET by ID

#### 8. Update preset gear
- PUT /api/presetgears?id={id}
- Request Body: same as create
- Response: same as GET by ID

#### 9. Delete preset gear
- DELETE /api/presetgears?id={id}
- Response: 204 NO CONTENT

<br>

### PresetCategoryController
Base Path: /api/presetcategories

#### 1. Find preset category by ID
- GET /api/presetcategories?id={id}
- Response:
```json
{
  "id": 1,
  "presetId": 1,
  "categoryId": 5
}
```

#### 2. Find preset categories by preset ID
- GET /api/presetcategories?presetId={presetId}
- Response:
```json
[
  {
    "id": 1,
    "presetId": 1,
    "categoryId": 5
  }
]
```

#### 3. Find preset categories by category ID
- GET /api/presetcategories?categoryId={categoryId}
- Response:
```json
[
  {
    "id": 1,
    "presetId": 1,
    "categoryId": 5
  }
]
```

#### 4. Check if preset-category mapping exists
- GET /api/presetcategories/exists?presetId={presetId}&categoryId={categoryId}
- Response:
```json
true
```

#### 5. Delete preset categories by preset ID
- DELETE /api/presetcategories?presetId={presetId}
- Response: 204 NO CONTENT

#### 6. Create preset category
- POST /api/presetcategories
- Request Body:
```json
{
  "presetId": 1,
  "categoryId": 5
}
```
- Response: same as GET by ID

#### 7. Update preset category
- PUT /api/presetcategories?id={id}
- Request Body: same as create
- Response: same as GET by ID

#### 8. Delete preset category
- DELETE /api/presetcategories?id={id}
- Response: 204 NO CONTENT

[Back to top](#dawker-api)

---

# Complex

The following DTOs and endpoints are meant to get you ALL the information for a user with a single API call.
This includes the user info, each of their presets, and each preset gear, preset category, gear item, and category for each of their presets.

###### -> Only GET requests

## UserAll

### UserAllDTO
```java
public record UserAllDTO(
    UserDTO user,
    Map<Long, PresetDTO> presets, // presetID -> preset
    Map<Long, PresetGearDTO> presetGears, // presetGearID -> presetGear
    Map<Long, GearItemDTO> gearItems, // gearItemID -> gearItem
    Map<Long, PresetCategoryDTO> presetCategories, // presetCategoryID -> presetCategory
    Map<Long, CategoryDTO> categories // categoryID -> category
) {}
```
Fields:
- user – User’s DTO.
- presets – Map of preset IDs to their preset for each of the user's presets.
- presetGears – Map of preset gear IDs to their preset gear for each preset gear in any of the user's presets.
- gearItems – Map of gear item IDs to their gear item for each gear item in any of the user's presets.
- presetCategories – Map of preset category IDs to their preset category for each preset category in any of the user's presets.
- categories – Map of category IDs to their category for each category in any of the user's presets.

### UserAllController
**Base Path:** /api/users/all

#### 1. Find all user info and their presets' info by user ID
- GET /api/users/all?id={id}
- Response:
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "role": "USER",
    "presetIds": [10, 11]
  },

  "presets": {
    "10": {
      "id": 10,
      "userId": 1,
      "presetName": "Rock Lead",
      "presetGearIds": [100, 101],
      "presetCategoryIds": [200]
    },
    "11": {
      "id": 11,
      "userId": 1,
      "presetName": "Clean Rhythm",
      "presetGearIds": [102],
      "presetCategoryIds": [201]
    }
  },

  "presetGears": {
    "100": {
      "id": 100,
      "presetId": 10,
      "gearItemId": 1,
      "gainValue": 7.5,
      "toneValue": 8.0,
      "orderIndex": 1
    },
    "101": {
      "id": 101,
      "presetId": 10,
      "gearItemId": 2,
      "gainValue": 6.0,
      "toneValue": 7.5,
      "orderIndex": 2
    },
    "102": {
      "id": 102,
      "presetId": 11,
      "gearItemId": 1,
      "gainValue": 3.5,
      "toneValue": 6.0,
      "orderIndex": 1
    }
  },

  "gearItems": {
    "500": {
      "id": 1,
      "modelName": "Fender Stratocaster",
      "gearType": "PEDAL",
      "presetGearIds": [100, 102]
    },
    "501": {
      "id": 2,
      "modelName": "Marshall JCM800",
      "gearType": "AMP",
      "presetGearIds": [101]
    }
  },

  "presetCategories": {
    "200": {
      "id": 200,
      "presetId": 10,
      "categoryId": 1
    },
    "201": {
      "id": 201,
      "presetId": 11,
      "categoryId": 2
    }
  },

  "categories": {
    "1": {
      "id": 1,
      "categoryType": "POP",
      "presetCategoryIds": [200]
    },
    "2": {
      "id": 2,
      "categoryType": "ROCK",
      "presetCategoryIds": [201]
    }
  }
}
```

#### 2. Find all user info and their presets' info by username
- GET /api/users/all?username={username}
- Response: same as GET by ID returning UserAllDTO

## User Nested

### DTOs
These DTOs represent a **fully nested user view**, where a user contains presets, presets contain gears and categories, and related entities are embedded directly instead of referenced by IDs.
```java
public record UserNestedUserDTO(
    Long id,
    String username,
    String role,
    List<UserNestedPresetDTO> presets
){}

public record UserNestedPresetDTO(
    Long id,
    String name,
    List<UserNestedPresetCategoryDTO> presetCategories,
    List<UserNestedPresetGearDTO> presetGears
){}

public record UserNestedPresetGearDTO(
    Long id,
    Double gainValue,
    Double toneValue,
    Integer orderIndex,
    UserNestedGearItemDTO gearItem
){}

public record UserNestedGearItemDTO(
    Long id,
    String modelName,
    String gearType
){}

public record UserNestedPresetCategoryDTO(
    Long id,
    UserNestedCategoryDTO category
){}

public record UserNestedCategoryDTO(
    Long id,
    String categoryType
){}
```

### UserAllController
**Base Path:** /api/users/all/nested

#### 1. Find all nested user info and their presets' info by user ID
- GET /api/users/all/nested?id={id}
- Response:
```json
{
  "id": 1,
  "username": "john_doe",
  "role": "USER",
  "presets": [
    {
      "id": 10,
      "name": "Rock Lead",
      "presetCategories": [
        {
          "id": 100,
          "category": {
            "id": 2,
            "categoryType": "ROCK"
          }
        },
        {
          "id": 101,
          "category": {
            "id": 3,
            "categoryType": "JAZZ"
          }
        }
      ],
      "presetGears": [
        {
          "id": 1000,
          "gainValue": 7.5,
          "toneValue": 6.0,
          "orderIndex": 0,
          "gearItem": {
            "id": 1,
            "modelName": "Pedal Model",
            "gearType": "PEDAL"
          }
        },
        {
          "id": 1001,
          "gainValue": 5.0,
          "toneValue": 7.5,
          "orderIndex": 1,
          "gearItem": {
            "id": 2,
            "modelName": "Amp Model",
            "gearType": "AMP"
          }
        }
      ]
    },
    {
      "id": 11,
      "name": "Clean Rhythm",
      "presetCategories": [
        {
          "id": 102,
          "category": {
            "id": 1,
            "categoryType": "POP"
          }
        },
        {
          "id": 103,
          "category": {
            "id": 2,
            "categoryType": "ROCK"
          }
        }
      ],
      "presetGears": [
        {
          "id": 1002,
          "gainValue": 2.5,
          "toneValue": 6.5,
          "orderIndex": 0,
          "gearItem": {
            "id": 1,
            "modelName": "Pedal Model",
            "gearType": "PEDAL"
          }
        },
        {
          "id": 1003,
          "gainValue": 3.0,
          "toneValue": 5.5,
          "orderIndex": 1,
          "gearItem": {
            "id": 2,
            "modelName": "Amp Model",
            "gearType": "AMP"
          }
        }
      ]
    }
  ]
}
```

#### 2. Find all nested user info and their presets' info by username
- GET /api/users/all/nested?username={username}
- Response: same as GET by ID returning UserNestedUserDTO

[Back to top](#dawker-api)
