import re
import os

def to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def snake_case_match(m):
    return f"{m.group(1)}('{to_snake(m.group(2))}'"

def update_file(filepath, entity_name, entity_table, id_col_camel):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Insert helper functions
    helpers = """
function mapKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapKeys);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = mapKeys(obj[key]);
    }
    return newObj;
  }
  return obj;
}

function mapToSnake(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapToSnake);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = mapToSnake(obj[key]);
    }
    return newObj;
  }
  return obj;
}
"""
    if "function mapKeys" not in content:
        content = content.replace("const router = Router();\n", f"const router = Router();\n{helpers}\n")

    # 2. Convert table names
    content = content.replace("'transportBookings'", "'transport_bookings'")
    content = content.replace("'governmentSchemes'", "'government_schemes'")
    content = content.replace("'auditLogs'", "'audit_logs'")
    
    # 3. Convert query columns
    content = re.sub(r'(\.(?:eq|neq|gt|gte|lt|lte|in|is|ilike))\(\'([a-zA-Z0-9_]+)\'', snake_case_match, content)
    content = re.sub(r'\.order\(\'([a-zA-Z0-9_]+)\'', snake_case_match, content)
    content = re.sub(r'!([a-zA-Z0-9_]+)', lambda m: f"!{to_snake(m.group(1))}", content)

    # 4. Handle or queries in transport.ts
    content = content.replace("`transporterId.eq.${req.user!.id},and(status.eq.requested,transporterId.is.null)`", 
                              "`transporter_id.eq.${transporterId},and(status.eq.requested,transporter_id.is.null)`")

    # 5. Fix up entity ID logic
    if entity_name:
        # We need to inject the fetch at the top of try block in handlers
        # and replace req.user!.id with entityId in the right places.
        # Places like: `eq('transporter_id', req.user!.id)` -> `eq('transporter_id', transporterId)`
        # `transporterId: req.user!.id` -> `transporter_id: transporterId`
        
        fetch_str = f"    const {{ data: {entity_name}User }} = await supabase.from('{entity_table}').select('id').eq('user_id', req.user!.id).single();\n    if (!{entity_name}User) throw createApiError(404, 'Profile not found');\n    const {id_col_camel} = {entity_name}User.id;\n"
        
        # Replace req.user!.id with the variable where applicable
        content = content.replace(f"eq('{to_snake(id_col_camel)}', req.user!.id)", f"eq('{to_snake(id_col_camel)}', {id_col_camel})")
        content = content.replace(f"{id_col_camel}: req.user!.id", f"{to_snake(id_col_camel)}: {id_col_camel}")
        content = content.replace(f"{id_col_camel}:req.user!.id", f"{to_snake(id_col_camel)}: {id_col_camel}")
        
        # Also handle `industryId = req.user!.id` in analytics/dashboard
        content = content.replace(f"const {id_col_camel} = req.user!.id;", fetch_str.strip())
        
        # Now inject fetch_str into try blocks that use `id_col_camel`
        def inject_fetch(m):
            body = m.group(2)
            if id_col_camel in body and fetch_str.strip() not in body:
                return m.group(1) + "\n" + fetch_str + body
            return m.group(0)
            
        content = re.sub(r'(\btry\s*\{)([\s\S]*?\})', inject_fetch, content)

    # 6. Apply mapKeys to res.json responses
    def wrap_res_json(m):
        data = m.group(1)
        if 'mapKeys' not in data and 'success' in data:
            # We want to wrap the `data: { ... }` part with mapKeys
            # e.g., data: { vehicles } -> data: mapKeys({ vehicles })
            return m.group(0).replace("data: {", "data: mapKeys({").replace("} }", "}) }")
        return m.group(0)
    
    # regex for res.json({ success: true, data: { ... } })
    # content = re.sub(r'res\.json\(\{\s*success:\s*true,\s*(data:\s*\{[^\}]+\})\s*\}\)', wrap_res_json, content)
    # Let's do a simple string replace for data payload mappings
    content = re.sub(r'data:\s*\{([^}]+)\}', r'data: mapKeys({\1})', content)
    # Fix nested maps
    content = content.replace("mapKeys({ vehicles }) }", "mapKeys({ vehicles })")
    content = content.replace("mapKeys({ bookings, ...buildPaginationResponse(total || 0, page, limit) })", "mapKeys({ bookings, ...buildPaginationResponse(total || 0, page, limit) })")

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

update_file('c:/Users/siddh/OneDrive/Desktop/Farming Source/agriassist/apps/api/src/routes/transport.ts', 'transporter', 'transporters', 'transporterId')
update_file('c:/Users/siddh/OneDrive/Desktop/Farming Source/agriassist/apps/api/src/routes/industry.ts', 'industry', 'industries', 'industryId')
update_file('c:/Users/siddh/OneDrive/Desktop/Farming Source/agriassist/apps/api/src/routes/admin.ts', None, None, None)

print("Done")
