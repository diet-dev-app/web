import { useState, type FormEvent, useEffect } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import { useMealOptions } from '@/context/MealOptionsContext';
import Alert from '@/components/Alert/Alert';
import { MEAL_TIMES } from '@/utils/constants';
import type { MealOption, IngredientInput } from '@/types';

interface OptionEditModalProps {
  show: boolean;
  option: MealOption | null;   // null = create mode
  onClose: () => void;
  onSaved: () => void;
}

/**
 * Modal for creating or editing a meal option.
 * Supports name, description, meal_time, estimated_calories, and ingredients.
 */
export default function OptionEditModal({ show, option, onClose, onSaved }: OptionEditModalProps) {
  const { addOption, updateOption } = useMealOptions();
  const isEditing = option !== null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mealTimeId, setMealTimeId] = useState<number>(1);
  const [estimatedCalories, setEstimatedCalories] = useState<string>('');
  const [ingredients, setIngredients] = useState<IngredientInput[]>([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (option) {
      setName(option.name);
      setDescription(option.description || '');
      setMealTimeId(option.meal_time.id);
      setEstimatedCalories(option.estimated_calories?.toString() || '');
      setIngredients(
        option.ingredients.map((ing) => ({
          name: ing.name,
          quantity: ing.quantity,
          unit: ing.unit,
        }))
      );
    } else {
      // Reset form for create mode
      setName('');
      setDescription('');
      setMealTimeId(1);
      setEstimatedCalories('');
      setIngredients([]);
    }
  }, [option]);

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: 0, unit: 'g' }]);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof IngredientInput,
    value: string | number
  ) => {
    setIngredients(
      ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      )
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        meal_time_id: mealTimeId,
        estimated_calories: estimatedCalories ? parseFloat(estimatedCalories) : null,
        ingredients: ingredients.filter((ing) => ing.name.trim() !== ''),
      };

      if (isEditing && option) {
        await updateOption(option.id, payload);
      } else {
        await addOption(payload);
      }
      onSaved();
    } catch {
      setError('Error al guardar la opción.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditing ? 'Editar opción' : 'Nueva opción'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Nombre *</Form.Label>
                <Form.Control
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Bol de avena con fruta"
                  required
                  autoFocus
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Horario *</Form.Label>
                <Form.Select
                  value={mealTimeId}
                  onChange={(e) => setMealTimeId(parseInt(e.target.value))}
                >
                  {MEAL_TIMES.map(({ id, label }) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional"
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Calorías estimadas</Form.Label>
                <Form.Control
                  type="number"
                  value={estimatedCalories}
                  onChange={(e) => setEstimatedCalories(e.target.value)}
                  placeholder="kcal"
                  min={0}
                  step={0.1}
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Ingredients section */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Form.Label className="mb-0 fw-bold">Ingredientes</Form.Label>
              <Button variant="outline-success" size="sm" onClick={addIngredient}>
                + Ingrediente
              </Button>
            </div>

            {ingredients.length === 0 ? (
              <p className="text-muted small">
                Sin ingredientes. Añade uno con el botón de arriba.
              </p>
            ) : (
              ingredients.map((ing, idx) => (
                <Row key={idx} className="mb-2 align-items-center">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Nombre ingrediente"
                      value={ing.name}
                      onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Control
                      type="number"
                      size="sm"
                      placeholder="Cantidad"
                      value={ing.quantity || ''}
                      onChange={(e) =>
                        updateIngredient(idx, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      min={0}
                      step={0.1}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Control
                      type="text"
                      size="sm"
                      placeholder="Unidad"
                      value={ing.unit}
                      onChange={(e) => updateIngredient(idx, 'unit', e.target.value)}
                    />
                  </Col>
                  <Col md={2}>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => removeIngredient(idx)}
                    >
                      ✕
                    </Button>
                  </Col>
                </Row>
              ))
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Guardando...
              </>
            ) : isEditing ? (
              'Guardar cambios'
            ) : (
              'Crear opción'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
